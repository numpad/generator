
/*
 * This example requires compilation with the "USE_PROMPT" definition
 */

/* Asks for a filename */
var filename = prompt("Please enter a filename: ");
/* Reads 'filename' to var 'content' */
var content = read(filename);
/* Prints the content of file 'filename' */
print(content);

