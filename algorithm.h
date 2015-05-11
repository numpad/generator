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
	for (int i = 0; i < w * h; ++i) {
		js_level[i] = id;
	}
}

/* Find All of Type */
struct point* algo_findall(int *js_level, const int w, const int h, const int id) {
	struct point *root = NULL;
	
	/* for every block on the map */
	for (int y = 0; y < h; ++y) {
		for (int x = 0; x < w; ++x) {
			/* Check findall condition */
			if (js_level[x + y * w] == id) {
				if (root == NULL) /* first element */
					root = point_new(x, y);
				else
					point_append(root, x, y);
			}
		}
	}
	
	return root;
}

/* pushes an array of points on the js stack */
int algo_push_point_array(duk_context *ctx, struct point *points) {
	/* create array of positions*/
	duk_idx_t arr_idx = duk_push_array(ctx);
	/* count how many points we have */
	int idx_counter = 0;
	
	/* create a sub array for every point -> [x, y], then append it to the main point array */
	struct point *it = points;
	while (it != NULL) {
		/* create subarray for x,y */
		duk_idx_t subarr_idx = duk_push_array(ctx);
		/* push x coordinate to index 0 */
		duk_push_int(ctx, it->x);
		duk_put_prop_index(ctx, subarr_idx, 0);
		/* y to index 1 */
		duk_push_int(ctx, it->y);
		duk_put_prop_index(ctx, subarr_idx, 1);
		
		/* and append the element to the main array */
		duk_put_prop_index(ctx, arr_idx, idx_counter);
		
		/* increase counter and go to next element */
		++idx_counter;
		it = it->next;
	}
	
	return idx_counter;
}

#endif
