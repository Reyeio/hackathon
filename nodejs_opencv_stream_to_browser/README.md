# Install

Install OpenCV (http://docs.opencv.org/doc/tutorials/introduction/table_of_content_introduction/table_of_content_introduction.html)

We need the latest node-opencv package

    npm install
    npm install https://github.com/peterbraden/node-opencv/tarball/master


# Run

    # Stream from a TCP stream:
    node . tcp <LEPTON-IP-ADDRESS>

    # Stream from UDP:
    node . udp <LEPTON-IP-ADDRESS>

Open `http://localhost:5001/` in browser.
