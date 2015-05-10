CC=gcc
CSTD=-std=c99
CLIB=-lm
CSRC=lib/duktape.c lib/lodepng.c
CWARN=-Wall -pedantic

ENTRY=generate

all:
	${CC} ${CSTD} ${ENTRY}.c ${CSRC} ${CLIB} ${CWARN} -o${ENTRY}

clean:
	rm -f ./build
