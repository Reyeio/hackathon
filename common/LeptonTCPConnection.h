#ifndef __LEPTON_TCP_CONNECTION_H
#define __LEPTON_TCP_CONNECTION_H

#include <stdio.h>
#include <stdint.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <netdb.h>
#include <unistd.h>
#include <stdint.h>

class LeptonTCPConnection {
public:
    char *host;
    uint16_t port;
    int fd;

    LeptonTCPConnection(char *host, uint16_t port) {
        this->host = host;
        this->port = port;
        fd = -1;

    }

    ~LeptonTCPConnection() {
        closeSocket();
    }

    int getImage(uint16_t *image) {
        return recvBuff(image, 9600);
    }

    int connectTo() {
        int sock;
        struct hostent *he;
        struct sockaddr_in addr;
        int i;

        if ((he = gethostbyname(host)) == NULL) return -1;
        sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (sock == -1) return -1;
        addr.sin_family = AF_INET;
        addr.sin_port = htons(port);
        addr.sin_addr = *((struct in_addr *) he->h_addr_list[0]);
        for (i = 0; i < 8; i++) ((char *) &(addr.sin_zero))[i] = 0; // bzero
        if (connect(sock, (struct sockaddr *) &addr, sizeof(struct sockaddr)) == -1) return -1;

        return sock;
    }

    int connectSocket() {
        printf("Try to connect to %s:%d\n", host, port);

        fd = connectTo();
        if (fd < 0) {
            printf("Coudln't connect.\n");
            return -1;
        }

        return 0;
    }

    void closeSocket() {
        printf("Disconnected\n");
        if (fd == -1) {
            close(fd);
            fd = -1;
        }
    }


    ssize_t recvBuff(void *buff, size_t size) {
        if (fd == -1 && connectSocket() == -1) return -1;

        size_t arrived = 0;
        while (arrived < size) {
            ssize_t r = recv(fd, (uint8_t *) buff + arrived, size - arrived, 0);
            if (r < 0) return -1;
            arrived += r;
        }

        return 0;
    }


};

#endif