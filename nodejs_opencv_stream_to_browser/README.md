# Install

We need the latest node-opencv package

    npm install
    npm install https://github.com/peterbraden/node-opencv/tarball/master


# Run

    # Stream from a TCP stream:
    node . tcp <LEPTON-IP-ADDRESS>

    # Stream from UDP:
    node . udp <LEPTON-IP-ADDRESS>

Open `http://localhost:5001/` in browser.
