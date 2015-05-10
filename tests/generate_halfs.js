
/*
 * Always have a void-block registered first because
 * this one will be returned by the function 'get' if
 * the coordinates are not on the map.
 * Example:
 *    get(5, -3) returns block with id 0 --> void_block
 */
var void_block = register(0, 0, 0);       /* Params are r,g,b: color */
var dirt_block = register(132, 71, 21);
var water_block = register(46, 129, 166);

var odd = 0;
/* Loop over every point */
for (var y = 0; y < Height / 2; ++y) {
	for (var x = 0; x < Width; ++x) {
		/* If on top half: Set Water, else Dirt */
		if ((odd + y) % 2 == 1)
			set(x, y, water_block);
		else
			set(x, y, dirt_block);
		++odd;
	}
}

/*
 * Prints the map to stdout
 * This just shows the result without having to open the
 * image, therefore this is not necessarry to export the
 * map.
 */
for (var y = 0; y < Height; ++y) {
	var line = "";
	for (var x = 0; x < Width; ++x) {
		/* get current blocks id */
		var block = get(x, y);
		
		/* and compare it to know what to print */
		if (block == dirt_block) {
			line += "#";
		} else if (block == water_block) {
			line += "~"
		}
	}
	print(line);
}

