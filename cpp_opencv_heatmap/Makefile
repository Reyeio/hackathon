CFLAGS = `pkg-config --cflags opencv`
LIBS = `pkg-config --libs opencv`

all:
	g++ -o heatmap $(CFLAGS) index.cpp $(LIBS)
