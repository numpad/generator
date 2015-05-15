#ifndef ALGORITHM_H
#define ALGORITHM_H

#include <stdlib.h>
#include "lib/duktape.h"

/* linked list of points */
struct point {
	int x, y;
	struct point *next;
};

/* create a new point */
struct point *point_new(const int x, const int y) {
	struct point *p = malloc(sizeof(struct point));
	p->x = x;
	p->y = y;
	p->next = NULL;

	return p;
}

/* delete a point and all points linked to it */
void point_delete(struct point *p) {
	if (p->next != NULL)
		point_delete(p->next);
	
	free(p);
}

/* puts a point on the end of a linked list */
void point_append(struct point *p, const int x, const int y) {
	/* TODO: pretty naive approach, needs to go to every point only to append one point. maybe just put it in front of it? */
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

/* how many neighbors of type 'id' are near xp|yp */
int algo_neighbors_of(int *js_level, const int w, const int h, const int xp, const int yp, const int id) {
	int counter = 0;
	
	/* check every 8 blocks touching xp|yp */
	for (int y = yp - 1; y < yp + 2; ++y) {
		for (int x = xp - 1; x < xp + 2; ++x) {
			/* irgnore out of map and self */
			if (x < 0 || y < 0 || x >= w || y >= h || (x - xp == 0 && y - yp == 0))
				continue;
			
			if (js_level[x + y * w] == id)
				++counter;
		}
	}
	return counter;
}

/* returns distance to block in dir */
int algo_distance(int *js_level, const int w, const int h, const int x, const int y, const int dir, const int *ignored_ids, const int ignored_ids_len) {
	int distance = 0;

	if (dir == -2) {
		for (int i = y; i >= 0; --i) {
			const int id = js_level[x + i * w];
			char in_ignored = 0;
			for (int j = 0; j < ignored_ids_len; ++j) {
				if (ignored_ids[j] == id) {
					in_ignored = 1;
					break;
				}
			}
			if (!in_ignored)
				return distance;

			++distance;
		}
	} else if (dir == 1) {
		for (int i = x; i < w; ++i) {
			const int id = js_level[i + y * w];
			char in_ignored = 0;
			for (int j = 0; j < ignored_ids_len; ++j) {
				if (ignored_ids[j] == id) {
					in_ignored = 1;
					break;
				}
			}
			if (!in_ignored)
				return distance;
			
			++distance;
		}
	} else if (dir == 2) {
		for (int i = y; i < h; ++i) {
			const int id = js_level[x + i * w];
			char in_ignored = 0;
			for (int j = 0; j < ignored_ids_len; ++j) {
				if (ignored_ids[j] == id) {
					in_ignored = 1;
					break;
				}
			}
			if (!in_ignored)
				return distance;
			
			++distance;
		}
	} else if (dir == -1) {		
		for (int i = x; i >= 0; --i) {
			const int id = js_level[i + y * w];
			char in_ignored = 0;
			for (int j = 0; j < ignored_ids_len; ++j) {
				if (ignored_ids[j] == id) {
					in_ignored = 1;
					break;
				}
			}
			if (!in_ignored)
				return distance;
			
			++distance;
		}
	}

	return distance;
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
	
	point_delete(points);

	return idx_counter;
}

#endif
