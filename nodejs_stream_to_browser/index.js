if (process.argv.length < 3) {
    console.error("node . [tcp/udp] <LEPTON-IP-ADDRESS>");
    process.exit(-1);
}
var isTCP = process.argv[2] == "tcp";
var host = process.argv[3];

var net = require("net");
var fs = require("fs");

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

var b = new Buffer(0);

if (isTCP) {
    console.log("Connecting to TCP");

    var client = new net.Socket();

    client.connect(1370, host, function () {
        console.log("Connected to Lepton");
    });


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

} else {
    console.log("Listening on UDP");

    var dgram = require("dgram");
    var s = dgram.createSocket("udp4");
    var bufferCounter = 0;
    var frameBuffer = new Buffer(LEPTON_BUFFER_SIZE);
    var arrived = 0;
    var nextNumber = 0;

    s.on("message", function (data, rinfo) {
        if (rinfo.address != host) return;

        var counter = parseInt(data[0]);
        bufferCounter |= 1 << counter;

        data.copy(frameBuffer, arrived, 1, data.length);
        arrived += data.length - 1;

        if (counter == 6) {
            if (bufferCounter == 127) {
                var t = new Buffer(LEPTON_BUFFER_SIZE);
                for (var i = 0; i < 4800; i++) {
                    t[i * 2] = frameBuffer[i * 2 + 1];
                    t[i * 2 + 1] = frameBuffer[i * 2];
                }
                leptonFrameArrived(t);
            }
        }

        if (counter == 6 || nextNumber != counter) {
            bufferCounter = 0;
            arrived = 0;
            frameBuffer = new Buffer(LEPTON_BUFFER_SIZE);
        }

        nextNumber = (counter + 1) % 7;
    });
    s.bind(7370);

}
