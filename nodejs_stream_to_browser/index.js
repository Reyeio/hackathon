var net = require("net");
var fs = require("fs");

if (process.argv.length < 3) {
    console.error("Usage: node index.js <LEPTON-IP-ADDRESS>");
    process.exit(-1);
}

var host = process.argv[2];

var imageOpts = {
    gaussian: false,
    canny: false
};

var express = require("express");
var app = express();
app.use(express.static(__dirname + "/web"));

var http = require("http").createServer(app);
http.listen(5002, function () {
    console.log('HTTP listening on *:5002');
});

var io = require("socket.io")(http);
var clients = [];
io.on("connection", function (socket) {
    clients.push(socket);

    socket.on("disconnect", function () {
        var ind = clients.indexOf(socket);
        clients.splice(ind, 1);
    });
});

var LEPTON_BUFFER_SIZE = 9600;

function leptonFrameArrived(imageFrame) {
    for (var i = 0; i < clients.length; i++) {
        clients[i].volatile.emit("newFrame", imageFrame);
    }
}

var client = new net.Socket();

client.connect(1370, host, function () {
    console.log("Connected to Lepton");
});

var b = new Buffer(0);
client.on("data", function (data) {
    b = Buffer.concat([b, data]);
    while (b.length > LEPTON_BUFFER_SIZE) {
        var imageBuffer = new Buffer(LEPTON_BUFFER_SIZE);
        b.copy(imageBuffer, 0, 0, LEPTON_BUFFER_SIZE);
        leptonFrameArrived(imageBuffer);

        var t = new Buffer(b.length - LEPTON_BUFFER_SIZE);
        b.copy(t, 0, LEPTON_BUFFER_SIZE, b.length);
        b = t;
    }
});

client.on("close", function () {
    console.log("Connection to Lepton closed");
});
