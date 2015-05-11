#ifndef ALGORITHM_H
#define ALGORITHM_H

#include <stdlib.h>
#include "lib/duktape.h"

struct point {
	int x, y;
	struct point *next;
};

struct point *point_new(const int x, const int y) {
	struct point *p = malloc(sizeof(struct point));
	p->x = x;
	p->y = y;
	p->next = NULL;

	return p;
}

void point_delete(struct point *p) {
	if (p->next != NULL)
		point_delete(p->next);
	
	free(p);
}

void point_append(struct point *p, const int x, const int y) {
	struct point *it = p;
	while (it->next != NULL) {
		it = it->next;
	}

	it->next = malloc(sizeof(struct point));
	it->next->x = x;
	it->next->y = y;
	it->next->next = NULL;
}

/* Sets every block to 'id' */
void algo_fill(int *js_level, const int w, const int h, const int id) {
	/* TODO: memset converts int id to unsigned char -> max 255 blocks */
	memset(js_level, id, w * h);
}

/* Find All of Type */
struct point* algo_findall(int *js_level, const int w, const int h, const int id) {
	struct point *root = NULL;

	for (int y = 0; y < h; ++y) {
		for (int x = 0; x < w; ++x) {
			/* Check findall condition */
			if (js_level[x + y * w] == id) {
				if (root == NULL)
					root = point_new(x, y);
				else
					point_append(root, x, y);
			}
		}
	}
	
	return root;
}

#endif
