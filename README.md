# RobotEye hackathon
Currently there are three platforms that communicate with the FLIR Lepton sensor. The platforms are preloaded to stream automatically

Go to the directories and read the README.md file for further information or feel free to ask the guys with the blue FLIR shirts!

## Platforms
### Raspberry PI 2 (WiFi, TCP, C++/NodeJS)
Once the device is powered, it will connect to the WiFi. The box labeled with the router's number that it connects to and the static IP that is preconfigured.
Connect to the same network and you are ready to go! The device streams through TCP. Use C++ and NodeJS examples to examine the stream.

### Beagle Bone Black (USB, TCP, C++/NodeJS)
Connect the board via USB and download the necessary drivers from http://beagleboard.org/static/beaglebone/latest/README.htm. Once you connected the device's IP address will be 192.168.7.2. The device streams through TCP. Use C++ and NodeJS examples to examine the stream.

### RobotEye v1.0 / Wiced (USB/Power, UDP, NodeJS)
After powering the board, it starts send the packets via UDP. You can use the nodejs examples to examine the stream.
