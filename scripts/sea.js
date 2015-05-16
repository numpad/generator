/* Loads all blocks so we dont have to redefine every single one */
load_file("base/blocks.js");

function shuffle(o){
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
}

/* 3, 5 */
function generate_floor_form(steps, displace) {
	var points = [];
	for (var x = 0; x < Width; x += steps) {
		points.push(parseInt(Height / 8 * 7 + (Math.random() * (displace *2) - displace)));
	}

	points.sort();

	var result = [];
	for (var i = 0; i < points.length / steps; ++i) {
		result.push(points[i]);
	}
	shuffle(result);
	
	return result;
}

function connect(x0, y0, x1, y1, tile) {
	var dx = Math.abs(x1 - x0),
		sx = x0 < x1 ? 1 : -1;
	var dy = Math.abs(y1 - y0),
		sy = y0 < y1 ? 1 : -1;
	var err = (dx > dy ? dx : -dy) / 2;
	
	while (true) {
		set(x0, y0, tile);
		if (x0 === x1 && y0 === y1)
			break;
		var e2 = err;
		if (e2 > -dx) {
			err -= dy;
			x0 += sx;
		}
		if (e2 < dy) {
			err += dx;
			y0 += sy;
		}
	}
}	

function generate_floor(steps, displace) {
	var result = generate_floor_form(steps, displace);
	var steps2 = steps * steps;

	for (var i = 1; i < result.length - 1; ++i) {
		connect(i * steps2, result[i], (i+1) * steps2, result[i + 1], blocks.dirt);
	}
	
	var valleyheight = parseInt(Height / 3);
	connect(0, result[1] - valleyheight, steps2, result[1], blocks.dirt);
	connect((result.length - 1) * steps2, result[result.length - 1], Width - 1, result[result.length - 1] - valleyheight, blocks.dirt);

}

function lowest_block(arr) {
	var lowest_i = 0;
	var lowest   = 0;
	
	for (var i = 0; i < arr.length; ++i) {
		if (arr[i][1] > lowest) {
			lowest   = arr[i][1];
			lowest_i = i;
		}
	}

	return arr[lowest_i];
}

/* -------------------- */
fill(blocks.air);

generate_floor(3, 16);

var floor = findall(blocks.dirt);
for (var i = 0; i < floor.length; ++i) {
	//set(floor[i][0], floor[i][1] - 1, blocks.grass);
	connect(floor[i][0], floor[i][1], floor[i][0], Height, blocks.dirt);
}

var air = findall(blocks.air);
var lefthigh  = raycast(0, 0, 2, [blocks.air])[1],
	righthigh = raycast(Width - 1, 0, 2, [blocks.air])[1];
var lowest = lowest_block(air)[1];

for (var i = 0; i < air.length; ++i) {
	var x = air[i][0],
		y = air[i][1];
	
	if (y > lefthigh + Height / 10 && y > righthigh + Height / 10) {
		if (y > lowest - 8)
			set(x, y, blocks.water_dirt);
		else
			set(x, y, blocks.water);
	}
}

for (var i = 0; i < floor.length; ++i) {
	var x = floor[i][0],
		y = floor[i][1];
	
	if (get(x, y - 1) === blocks.air)
		set(x, y - 1, blocks.grass);
}

/* Prints the level */
load_file("base/print_level.js");

