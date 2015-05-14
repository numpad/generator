/* load default blocks */
load_file("base/blocks.js");

var amp = (Math.random() * 3 - 1) + 2,
	stretch = 20;

function set_between(xp, yp, ye, block) {
	for (var y = yp; y < ye; ++y) {
		set(xp, y, block);
	}
}

/* returns the y-position of the first non-air block when looking down from x|y */
function raycast_down(x, y) {
	for (var yp = y; yp < Height; ++yp) {
		if (get(x, yp) != blocks.air && get(x, yp) != blocks.grass)
			return yp;
	}
}

function rect(x, y, w, h, outer, inner) {
	for (var xp = x; xp < x + w; ++xp) {
		for (var yp = y; yp < y + h; ++yp) {
			if (xp == x || yp == y || xp == x + w - 1 || yp == y + h - 1)
				set(xp, yp, outer);
			else
				set(xp, yp, inner);
		}	
	}
}

var houses = [];
function gen_house(xp, yp, w, h) {
	/* add house to list */
	houses.push([parseInt(xp), ground - h, parseInt(w), h]);
	
	var mat      = blocks.wood,
		mat_wall = blocks.wood_wall;
	
	if (Math.random() < 0.1) {
		mat = blocks.castle;
		mat_wall = blocks.castle_wall;
	}
	var ground = Math.max(raycast_down(xp, yp), raycast_down(xp + w, yp));
	
	/* the basic form */
	rect(xp, ground - h, w, h, mat, mat_wall);
	
	/* doors on both sides */
	set_between(xp, ground - 3, ground - 1, blocks.door_wood);
	set_between(xp + w - 1, ground - 3, ground - 1, blocks.door_wood);
	
	/* lantern inside */
	if (Math.random() < 0.6)
		set(xp + (w / 2), ground - (h / 2) - 2, blocks.lantern);

	/* maybe a chimney? */
	if (Math.random() < 0.3) {
		var cx = xp + 1 + Math.round(Math.random() * (w - 3));
		for (var ci = 0; ci < Math.round(Math.random() * 2) + 2; ++ci) {
			set(cx - 1, ground - h - ci, blocks.castle);
			set(cx    , ground - h - ci, blocks.castle_wall);
			set(cx + 1, ground - h - ci, blocks.castle);
		}
	}
	
	if (Math.random() < 0.75) {
		set(xp, ground - (h / 2) - 1, blocks.platform_left);
		set(xp + w - 1, ground - (h / 2) - 1, blocks.platform_right);
	}
}

fill(blocks.air);

/**************************\
 * Generation begins here *
\**************************/


/* generate the floor in a sine form */
{
   var sine_start = Math.random() * 90;
   for (var x = 0; x < Width; ++x) {
	   var ypos = (Height/3)*2 + Math.sin(sine_start + x / stretch) * amp - amp*2;
	   set(x, ypos - 1, blocks.grass);
	   set_between(x, ypos, Height, blocks.dirt);
   }
}

/* how many homes to generate, and where */
for (var x = 0; x < Width; x += Math.random() * 10 + 20) {
	if (Math.random() < 0.8) {
		gen_house(x,
				 0,
				 11 + Math.round(Math.random() * 6 - 3),
				 Math.round(Math.random() * 3 + 7)
				);
	}
}

if (houses.length == 0) {
	gen_house(Width / 2 - 7,
			  0,
			  12,
			  8);
}

/* generate a well for the city */
{
	var longest_distance_index = 0;
	var longest_distance = 0;
	
	if (houses.length > 2) {
		for (var i = 0; i < houses.length - 1; ++i) {
			var left_pos = houses[i][0] + houses[i][2];
			var right_pos = houses[i + 1][0];
			var dist = right_pos - left_pos;
			

			if (dist > longest_distance) {
				longest_distance = dist;
				longest_distance_index = i;
			}
		}
	} else if (houses.length == 2) {
		longest_distance = houses[1][0] - (houses[0][0] + houses[0][2]);
	}

	if (longest_distance > 6) {
		var well_pos = houses[longest_distance_index][0] + houses[longest_distance_index][2] + longest_distance / 2;
		var well_height = raycast_down(well_pos, 0);
		var well_width = 3;

		for (var wwidth = 0; wwidth < well_width; ++wwidth) {
			set(well_pos + wwidth, well_height - 1, blocks.air);
			set(well_pos + wwidth, well_height, blocks.water);
			set_between(well_pos + wwidth,
						well_height + 1,
						Height,
						blocks.castle_wall);
		}
		set_between(well_pos - 1, well_height - 1, Height, blocks.castle);
		set_between(well_pos + well_width, well_height - 1, Height, blocks.castle);
	}
}

/* change some castle blocks to mossy */
{
	var castle = findall(blocks.castle);
	for (var i = 0; i < castle.length; ++i) {
		if (Math.random() < 0.25)
			set(castle[i][0], castle[i][1], blocks.castle_mossy);
	}

	var castle_wall = findall(blocks.castle_wall);
	for (var i = 0; i < castle_wall.length; ++i) {
		if (Math.random() < 0.25)
			set(castle_wall[i][0], castle_wall[i][1], blocks.castle_mossy_wall);
	}

}

/* change 25% of grass to flowers or bushes */ {
	var grass = findall(blocks.grass);
	for (var i = 0; i < grass.length; ++i) {
		if (Math.random() < 0.25) {
			var tile = (Math.random() < 0.4)
				? blocks.bush
				: blocks.flower;
			set(grass[i][0], grass[i][1], tile);
		}
	}
}

/* generate some stone */ {
	var dirt = findall(blocks.dirt);
	for (var i = 0; i < dirt.length; ++i) {
		if (Math.random() < 0.2) {
			set(dirt[i][0], dirt[i][1], blocks.stone);
		}
	}
	
	var dirts = findall(blocks.dirt);
	for (var i = 0; i < dirts.length; ++i) {
		if (neighbors_of(dirts[i][0], dirts[i][1], blocks.stone) > 4) {
			set(dirts[i][0], dirts[i][1], blocks.stone);
		}
	}

	dirts = findall(blocks.dirt);
	for (var i = 0; i < dirts.length; ++i) {
		if (neighbors_of(dirts[i][0], dirts[i][1], blocks.stone) > 3) {
			set(dirts[i][0], dirts[i][1], blocks.stone_thick);
		}
	}
	
}

/* some kind of erosion */ {
	for (var x = 0; x < Width; ++x) {
		var yground = raycast_down(x, 0);

		if (get(x, yground) == blocks.dirt) {
			if (Math.random() < 0.05) {
				var depth = Height - (Math.random() * 6 + 4);
				set_between(x,
							yground,
							depth,
							blocks.dirt_wall);
				
				set_between(x - 1,
							depth - 4,
							depth + 1,
							blocks.dirt_wall);

				set_between(x + 1, depth - 5, depth + 2, blocks.gold);
				set(x - 1, depth, blocks.bedrock);
				set(x, depth, blocks.water_dirt);
			}
		}
	}
}

/* render the map */
/*
for (var y = 0; y < Height; ++y) {
	var line = "";
	for (var x = 0; x < Width; ++x) {
		var block = get(x, y);
		switch(block) {
		case blocks.air:
			line += " ";
			break;
		case blocks.dirt:
			if (get(x, y - 1) == blocks.grass)
				line += "\x1b[32m#\x1b[0m";
			else
				line += "\x1b[33;2m#\x1b[0m";
			break;
		case blocks.dirt_wall:
			line += "\x1b[33;2m:\x1b[0m";
			break;
		case blocks.stone:
			line += "+";
			break;
		case blocks.stone_thick:
			line += "=";
			break;
		case blocks.gold:
			line += "\x1b[33m*\x1b[0m";
			break;
		case blocks.bedrock:
			line += "X";
			break;
		case blocks.water:
		case blocks.water_dirt:
			line += "\x1b[34m~\x1b[0m";
			break;
		case blocks.tree:
			line += "\x1b[32;2m!\x1b[0m";
			break;
		case blocks.grass:
			line += "\x1b[32m,\x1b[0m";
			break;
		case blocks.tent_blue:
			line += "\x1b[34m$\x1b[0m";
			break;
		case blocks.tent_red:
			line += "\x1b[31m$\x1b[0m";
			break;
		case blocks.flower:
			line += "\x1b[35m&\x1b[0m"
			break;
		case blocks.door_stone:
		case blocks.door_wood:
			line += "|";
			break;
		case blocks.wood:
			line += "\x1b[33;2m=\x1b[0m";
			break;
		case blocks.wood_wall:
			line += "\x1b[33;2m-\x1b[0m";
			break;
		case blocks.castle:
			line += "#";
			break;
		case blocks.castle_wall:
			line += ".";
			break;	
		case blocks.castle_mossy:
			line += "\x1b[32m%\x1b[0m";
			break;
		case blocks.castle_mossy_wall:
			line += "\x1b[32m;\x1b[0m";
			break;
		case blocks.lantern:
			line += "\x1b[31m&\x1b[0m";
			break;
		case blocks.platform_left:
			line += "\x1b[33;2m[\x1b[0m";
			break;
		case blocks.platform_right:
			line += "\x1b[33;2m]\x1b[0m";
			break;
		default:
			line += "?";
			break;
		};
	}
	print(line);
}
*/

