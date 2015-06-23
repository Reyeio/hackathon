#include <stdio.h>

#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/contrib/contrib.hpp>

#include "../common/LeptonTCPConnection.h"

using namespace cv;

int running = 1;


int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <LEPTON-IP-ADDRESS>\n", argv[0]);
        exit(-1);
    }

    LeptonTCPConnection ltc(argv[1], 1370);

    uint16_t image[60 * 80];

    namedWindow("video", CV_WINDOW_NORMAL);

    while (running) {
        ltc.getImage(image);

        Mat img(60, 80, CV_16UC1, image, 160);
        double minVal, maxVal;
        minMaxLoc(img, &minVal, &maxVal);
        img.convertTo(img, CV_8UC1, 255.0 / (maxVal - minVal), -minVal * 255.0 / (maxVal - minVal));

        applyColorMap(img, img, COLORMAP_HOT);

        imshow("video", img);
        waitKey(1);
    }

    destroyWindow("video");

    return 0;
}
