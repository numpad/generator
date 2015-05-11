#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "lib/duktape.h"
#include "lib/lodepng.h"
#include "algorithm.h"

/* uncomment this line to enable the unsafe, deprecated use of the 'gets' function. This will add the function 'prompt' to the js environment */
//#define USE_PROMPT

#define VERSION "0.5"

/* how to save a block-type */
struct color {
	unsigned char r, g, b;
};

/* store all block-ids in here -> the level*/ 
int *js_level;
/* store all blocks here (colors on png when exported) */
struct color *blocks;
/* How many blocks are stored, how much space is allocated for them */
int blocks_len = 0,
	blocks_max_len = 90;

/* default level dimensions, may be overwritten by command line args */
int js_level_width  = 50,
	js_level_height = 30;
/* prints how to use the program */
void print_usage(const char *arg0) {
	puts("Usage:");
  printf(" %s <filename.js> [flags ..]\n", arg0);
	puts("");
	puts(" --   Flags   --");
	puts("  -w, --width  <int>  : Set level width");
	puts("  -h, --height <int>  : Set level height");
	puts("  -o, --output <file> : Export image named <file>");
	puts("");
	puts(" -- Functions --");
	puts("  This map generator uses the Duktape (duktape.org)");
	puts("  Javascript engine which follows the EcmaScript 5/");
	puts("  5.1 specification.");
	puts("  Additional, native functions are:");
	puts("");
	puts("  get(x, y)         : Returns the BlockID at position x|y");
	puts("  read(name)        : Returns the contents of file 'name'");
#ifdef USE_PROMPT
	puts("  prompt(msg)       : Asks for user input  and returns it");
#endif
	puts("  set(x, y, id)     : Sets the Blocks' ID at position x|y");
	puts("  load_file(file)   : Load and evaluate a Javascript file");
	puts("  register(r, g, b) : Register a Block and return it's ID");
	puts("");
	puts("Version:");
	puts("  v" VERSION);
#ifdef USE_PROMPT
	puts("  Compiled with USE_PROMPT flag");
#endif
}

/* read a file and return its content */
const char* read_file(const char *filename, int *length) {
	char *buf;

	/* try opening the file */
	FILE *fp = fopen(filename, "r");
	if (!fp) {
		printf("Failed to open file '%s'\n", filename);
		return NULL;
	}
	
	/* get length of file */
	fseek(fp, 0, SEEK_END);
	*length = ftell(fp);
	fseek(fp, 0, SEEK_SET);
	/* allocate enough memory */
	buf = malloc(*length);
	
	/* read the content */
	if (buf)
		fread(buf, 1, *length, fp);
	
	/* close the file */
	fclose(fp);
	return buf;
}

/* reads a file from path and returns it as string */
int js_read_file(duk_context *ctx) {
	
	/* return error if no filename is given */
	if (duk_get_top(ctx) == 0) {
		printf("'read' expects one argument: 0 given\n");
		return DUK_RET_TYPE_ERROR;
	}
	
	/* also needs to be a string */
	if (!duk_is_string(ctx, 0)) {
		printf("'read' expects argument 1 of type string\n");
		return DUK_RET_TYPE_ERROR;
	}

	/* get the first argument */
	const char *filename = duk_get_string(ctx, 0);

	/* save file contents in this buffer */
	char *buffer = 0;
	/* how big is the file? */
	long length;

	/* try opening the file */
	FILE *fp = fopen(filename, "r");
	if (!fp) {
		printf("Failed to open file '%s'\n", filename);
		return DUK_RET_TYPE_ERROR;
	}
	
	/* get the files length... */
	fseek(fp, 0, SEEK_END);
	length = ftell(fp);
	fseek(fp, 0, SEEK_SET);
	/* ...allocate memory for its content... */
	buffer = malloc(length);
	/* ...and get its content if possible */
	if (buffer)
		fread(buffer, 1, length, fp);

	/* close the file again */
	fclose(fp);
	
	/* finally, push the string on the js stack */
	duk_push_string(ctx, buffer);
	free(buffer);
	return 1;
}

#ifdef USE_PROMPT
/* displays a message and returns user input */
int js_prompt(duk_context *ctx) {
	/* display message */
	printf("%s", duk_to_string(ctx, 0));
	/* FIXME: Max 128 bytes? Using gets in C99? please don't be mad :( */
	
	char buf[128];
	gets(buf);
	/* return the string */
	duk_push_string(ctx, buf);
	return 1;
}
#endif

/* create a new struct color */
const struct color color_new(const int r, const int g, const int b) {
	struct color new_color;
	new_color.r = (unsigned char)r;
	new_color.g = (unsigned char)g;
	new_color.b = (unsigned char)b;

	return new_color;
}


/* register a block for global blocks */
void register_block(const int r, const int g, const int b) {
	const struct color new_block = color_new(r, g, b);
	
	/* if free memory for blocks is less than 6 blocks, allocate 15 new */
	if (blocks_max_len - blocks_len <= 5) {
		/* DEBUG: Print message on realloc
		printf("Reached %d blocks. Reallocating space to %d.",
				blocks_len, blocks_max_len + 20);
		*/
		blocks_max_len += 15;
		blocks = realloc(blocks, sizeof(struct color) * blocks_max_len);
	}
	
	/* append new_block to blocks */
	blocks[blocks_len] = new_block;
	/* update length */
	++blocks_len;
}

/* registers a block r,g,b and returns it's id */
int js_register_block(duk_context *ctx) {
	/* get r, g, b values */
	const int r = duk_get_int(ctx, 0);
	const int g = duk_get_int(ctx, 1);
	const int b = duk_get_int(ctx, 2);
	
	/* registers block, may allocate more memory */
	register_block(r, g, b);
	
	/* return block's id */
	duk_push_int(ctx, blocks_len - 1);

	return 1;
}

/* sets block x|y to id */
int js_level_set(duk_context *ctx) {
	const int x = duk_get_int(ctx, 0);
	const int y = duk_get_int(ctx, 1);
	const int id = duk_get_int(ctx, 2);
	
	/* bound checking */
	if (x < 0 || x >= js_level_width || y < 0 || y >= js_level_height)
		return 0;
	
	js_level[x + y * js_level_width] = id;
	return 0;
}

/* get block id */
int js_level_get(duk_context *ctx) {
	/* use x|y coordinates */
	const int x = duk_get_int(ctx, 0);
	const int y = duk_get_int(ctx, 1);
	
	/* do bounds check, return block id 0 -> void-block */
	if (x < 0 || x >= js_level_width || y < 0 || y >= js_level_height) {
		duk_push_int(ctx, 0);
		return 1;
	}
	
	/* get block id */
	const int id = js_level[x + y * js_level_width];
	duk_push_int(ctx, id);

	return 1;
}

/* load and eval a file */
int js_load_file(duk_context *ctx) {
	const char *file = duk_get_string(ctx, 0);
	duk_eval_file(ctx, file);
	return 0;
}

/* exports the level as png image */
void export_level(char *filename) {
	/* add file extension if not given */
	if (!strstr(filename, ".png")) {
		strcat(filename, ".png");
	}

	/* allocate memory for every block * 4 (RGBA) */
	unsigned char *image = malloc(js_level_width * js_level_height * 4);
	
	/* visit every R index and write R, G, B, A --> 4 steps */
	for (int i = 0; i < js_level_width * js_level_height * 4; i += 4) {
		/* get color */
		const struct color block = blocks[js_level[i / 4]];
		/* set R, G, B and A */
		image[i + 0] = block.r;
		image[i + 1] = block.g;
		image[i + 2] = block.b;
		image[i + 3] = 255;
	}
	
	/* encode the image with lodepng */
	unsigned error = lodepng_encode32_file(filename,
		image,
		js_level_width,
		js_level_height);
	/* if there's an error, print it! */
	if (error)
		printf("Error %u: %s\n", error, lodepng_error_text(error));
	
	/* free memory for image */
	free(image);
}

/* Find all occurences of block type and return their positions */
int js_algo_findall(duk_context *ctx) {
	/* block id */
	const int search_id = duk_to_int(ctx, 0);

	/* finds all blocks of id */
	struct point *result = algo_findall(js_level, js_level_width, js_level_height, search_id);
	
	/* create array of positions*/
	duk_idx_t arr_idx = duk_push_array(ctx);
	int idx_counter = 0;

	struct point *it = result;
	while (it != NULL) {
		/* create subarray for x,y */
		duk_idx_t subarr_idx = duk_push_array(ctx);
		duk_push_int(ctx, it->x);
		duk_put_prop_index(ctx, subarr_idx, 0);
		duk_push_int(ctx, it->y);
		duk_put_prop_index(ctx, subarr_idx, 1);
		
		duk_put_prop_index(ctx, arr_idx, idx_counter);
	
		//duk_pop(ctx);
		
		++idx_counter;
		it = it->next;
	}

	return 1;
}

int main(int argc, char *argv[]) {
	/* initialize js environment */
	duk_context *ctx = duk_create_heap_default();
	
	/* add native functions to js environment */
	duk_push_global_object(ctx);
	/* 'read' */
	duk_push_c_function(ctx, js_read_file, 1);
	duk_put_prop_string(ctx, -2, "read");
#ifdef USE_PROMPT
	/* 'prompt' */
	duk_push_c_function(ctx, js_prompt, 1);
	duk_put_prop_string(ctx, -2, "prompt");
#endif
	/* 'get' */
	duk_push_c_function(ctx, js_level_get, 2);
	duk_put_prop_string(ctx, -2, "get");
	/* 'set' */
	duk_push_c_function(ctx, js_level_set, 3);
	duk_put_prop_string(ctx, -2, "set");
	/* 'register_block' */
	duk_push_c_function(ctx, js_register_block, 3);
	duk_put_prop_string(ctx, -2, "register");
	/* 'load_file' */
	duk_push_c_function(ctx, js_load_file, 1);
	duk_put_prop_string(ctx, -2, "load_file");
	/* 'algo_findall' */
	duk_push_c_function(ctx, js_algo_findall, 1);
	duk_put_prop_string(ctx, -2, "findall");
	/* pop global object */
	duk_pop(ctx);

	
	/* try to load some basic functionality */
	if (duk_peval_file(ctx, "base/base.js") != 0) {
		printf("Failed to load 'base/base.js': %s\n", duk_safe_to_string(ctx, -1));
	}
	duk_pop(ctx);
	
	if (argc > 1) {
		/* run garbage collector (twice as told by the docs) */
		duk_gc(ctx, 0);
		duk_gc(ctx, 0);
		
		/* where to save the png */
		char *export_file = "generated_map.png";
		
		/* parse command line flags */
		for (int i = 0; i < argc; ++i) {
			if (!strcmp(argv[i], "--width") || !strcmp(argv[i], "-w")) {
				if (i + 1 < argc)
					js_level_width = atoi(argv[i + 1]);
			} else if (!strcmp(argv[i], "--height") || !strcmp(argv[i], "-h")) {
				if (i + 1 < argc)
					js_level_height = atoi(argv[i + 1]);
			} else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--output")) {
				if (i + 1 < argc)
					export_file = argv[i + 1];
			}
		}
		
		/* reserve enough memory for level */
		js_level = malloc(sizeof(int) * js_level_width * js_level_height);
		blocks = malloc(sizeof(struct color) * blocks_max_len);
		
		/* set all zeroes, maybe change this use to calloc */
		memset(js_level, 0, sizeof(int) * js_level_width * js_level_height);

		/* declare & assign global variable Width & Height */
		duk_push_int(ctx, js_level_width);
		duk_put_global_string(ctx, "Width");
		duk_push_int(ctx, js_level_height);
		duk_put_global_string(ctx, "Height");

		if (duk_peval_file(ctx, argv[1]) != 0) {
			printf("('%s') %s\n", argv[1], duk_safe_to_string(ctx, -1));
		}
		duk_pop(ctx);
		
		/* export the level as png */
		export_level(export_file);

		/* free all memory */ 
		free(js_level);
		free(blocks);
	} else {
		/* tell the user how to use this */
		print_usage(argv[0]);
	}

	/* clean up */
	duk_destroy_heap(ctx);
	return 0;
}

