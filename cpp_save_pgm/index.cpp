#include <stdio.h>
#include "../common/LeptonTCPConnection.h"

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <LEPTON-IP-ADDRESS>\n", argv[0]);
        exit(-1);
    }

    LeptonTCPConnection ltc(argv[1], 1370);

    uint16_t image[60 * 80];
    ltc.getImage(image);

    uint32_t i, j, max = 0, min = 16383;
    FILE *f = fopen("image.pgm", "w");
    if (!f) return -1;

    for (i = 0; i < 60 * 80; i++) {
        if (image[i] > max) max = image[i];
        if (image[i] < min) min = image[i];
    }

    fprintf(f, "P2\n80 60\n%u\n", max - min);
    for (i = 0; i < 60; i++) {
        for (j = 0; j < 80; j++) fprintf(f, "%d ", image[i * 80 + j] - min);
        fprintf(f, "\n");
    }
    fprintf(f, "\n\n");

    fclose(f);

    return 0;
}
