/* 
 * This adds some basic functionality. You may change the content
 * of this file but any little change may fuck things up. So be
 * careful!
 */

/*
 * In order to get RequireJS working, we need to tell it
 * how to find and load modules. This simple function calls
 * the C function 'js_read_file' found in build.c to read a
 * file and return its content as a string.
 */
Duktape.modSearch = function(id, require, exports, module) {
	/* native function 'js_read_file' */
	return read(id);
};

