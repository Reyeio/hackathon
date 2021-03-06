if (process.argv.length < 3) {
    console.error("node . [tcp/udp] <LEPTON-IP-ADDRESS>");
    process.exit(-1);
}
var isTCP = process.argv[2] == "tcp";
var host = process.argv[3];

var net = require("net");
var fs = require("fs");
var opencv = require("opencv");

var imageOpts = {
    gaussian: false,
    canny: false
};

var express = require("express");
var app = express();
app.use(express.static(__dirname + "/web"));

var http = require("http").createServer(app);
http.listen(5001, function () {
    console.log('HTTP listening on *:5001');
});

var io = require("socket.io")(http);
var clients = [];
io.on("connection", function (socket) {
    clients.push(socket);

    socket.on("disconnect", function () {
        var ind = clients.indexOf(socket);
        clients.splice(ind, 1);
    });

    socket.emit("imageOpts", imageOpts);
    socket.on("imageOpts", function (d) {
        imageOpts = d;
    });

});

var LEPTON_BUFFER_SIZE = 9600;

function leptonFrameArrived(imageFrame) {
    var img = new opencv.Matrix(60, 80, opencv.Constants.CV_8UC1);

    var norm = new Buffer(80 * 60),
        min = 16383,
        max = 0,
        v, i;

    for (i = 0; i < 60 * 80; i++) {
        v = imageFrame.readIntLE(i * 2, 2);
        if (v > max) max = v;
        if (v < min) min = v;
    }

    for (i = 0; i < 60 * 80; i++) {
        v = imageFrame.readIntLE(i * 2, 2);
        norm[i] = (v - min) / (max - min) * 255;
    }
    img.put(norm);

    if (imageOpts.canny) img.canny();
    if (imageOpts.gaussian) img.gaussianBlur();

    var fn = "tmp" + Math.random() + ".jpg";
    img.save(fn);
    var buffer = fs.readFileSync(fn);
    fs.unlinkSync(fn);

    for (var i = 0; i < clients.length; i++) {
        var s = clients[i];
        s.volatile.emit("newFrame", buffer);
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
