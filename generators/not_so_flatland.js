
/*
 * This document is licensed under the Creative Commons CC0 Lincense.
 * Feel free to do whatever you want with this script; You may modify,
 * distribute or even sell it.
 *
 * This is a rather simple generator script, it is inefficient and not
 * very elegant but produces surprisingly good results.
 */

/* Load 'blocks.js' so we don't have to register every default block */
load_file('base/blocks.js');

/*
 * Utility functions
 */

/* fills the whole map with 'tile' */
function fill(tile) {
	for (var y = 0; y < Height; ++y) {
		for (var x = 0; x < Width; ++x) {
			set(x, y, tile);
		}
	}
}

/* how many neighbors of type 'neighbor_type' are around me */
function neighbors_of(x, y, neighbor_type) {
	var counter = 0;
	for (var yp = -1; yp < 2; ++yp) {
		for (var xp = -1; xp < 2; ++xp) {
			/* block 0|0 (relative) is never a neighbor */
			if (xp == 0 && yp == 0)
				continue;
			
			/* bounds check */
			if (x + xp < 0 || y + yp < 0 || x + xp > Width || y + yp > Height) {
				continue;
			}

			if (get(x + xp, y + yp) == neighbor_type)
				++counter;
		}
	}
	return counter;
	
}

/* how many non-air blocks are around me in a 3x3 field */
function neighbors(x, y) {
	var counter = 0;
	for (var yp = -1; yp < 2; ++yp) {
		for (var xp = -1; xp < 2; ++xp) {
			/* dont check self */
			if (xp == 0 && yp == 0)
				continue;
			
			/* bounds check */
			if (x + xp < 0 || y + yp < 0 || x + xp > Width || y + yp > Height) {
				continue;
			}
			
			if (get(x + xp, y + yp) != blocks.air)
				++counter;
		}
	}
	return counter;
}

/* sets block x|y to stone. chance is in range 0..1 */
function set_stone(x, y, chance) {
	/* if Math.random() is smaller than chance, set block to thickstone */
	var stone_type = (Math.random() < chance) ? blocks.stone_thick : blocks.stone;
	set(x, y, stone_type);
}

/* returns the y-position of the first non-air block when looking down from x|y */
function raycast_down(x, y) {
	for (var yp = y; yp < Height; ++yp) {
		if (get(x, yp) != blocks.air)
			return yp;
	}
}

function contains(ar, pt) {
	for (var i = 0; i < ar.length; ++i) {
		if (ar[i][0] === pt[0] && ar[i][1] === pt[1]) {
			return true;
		}
	}
	return false;
}

/* gets size of room using flood fill */
function flood_find(x, y) {
	var res = [];
	var stack = [[x, y]];

	while (stack.length > 0) {
		var pos = stack.pop();
		
		if (get(pos[0], pos[1]) == blocks.air && !contains(res, pos)) {
			res.push(pos);
			
			if (get(x + 1, y) == blocks.air)
				stack.push([pos[0] + 1, pos[1]]);
			if (get(x - 1, y) == blocks.air)
				stack.push([pos[0] - 1, pos[1]]);
			if (get(x, y + 1) == blocks.air)
				stack.push([pos[0], pos[1] + 1]);
			if (get(x, y - 1) == blocks.air)
				stack.push([pos[0], pos[1] - 1]);
		}
	}

	return res;
}

/* find every occurence of blocktype */
function find_all(blocktype) {
	var res = [];
	for (var y = 0; y < Height; ++y) {
		for (var x = 0; x < Width; ++x) {
			if (get(x, y) == blocktype)
				res.push([x, y]);
		}
	}
	return res;
}

/* generates a tent, block = .tent.red / ..blue. side is either Width or 0*/
function gen_tent(spawn_block, side) {
	var y = 0;
	var x = 0;
	if (side < Width / 2)
		x = side + 5 + Math.round(Math.random() * 8 - 3);
	else
		x = side - 5 - Math.round(Math.random() * 8 + 3);
	
	var y_ground = raycast_down(x, y);

	set(x, y_ground - 1, spawn_block); 
	set(x - 2, y_ground, blocks.dirt);
	set(x - 1, y_ground, blocks.dirt);
	set(x, y_ground, blocks.dirt);
	set(x + 1, y_ground, blocks.dirt);
	set(x + 2, y_ground, blocks.dirt);

}

// Starting map Generation

/* fill background with air, place dirt on top of it */
fill(blocks.air);
for (var y = 0; y < Height; ++y) {
	for (var x = 0; x < Width; ++x) {
		if (y > Math.random() * Height) 
			 if (y > Height / 2)
				set(x, y, blocks.dirt);
			else
				if (Math.random() < 0.5)
				   set(x, y, blocks.dirt);
	}
}


for (var y = 0; y < Height; ++y) {
	for (var x = 0; x < Width; ++x) {
		var cur_block = get(x, y);

		if (cur_block != blocks.air && neighbors(x, y) < 2) {
			set(x, y, blocks.air);
		}

		if (y > 2.7 * (Height / 4)) {
			if (cur_block == blocks.air) {
				set_stone(x, y, 0.4);
				if (Math.random() < 0.4)
					set_stone(x - 1, y - 1, 0.2);
				if (Math.random() < 0.4)
					set_stone(x + 1, y - 1, 0.2);
			}
		}
	}
}

var sky_blocks = flood_find(0, 0);
for (var y = 0; y < Height; ++y) {
	for (var x = 0; x < Width; ++x) {
		if (get(x, y) == blocks.air && !contains(sky_blocks, [x, y])) {
			set(x, y, blocks.dirt_wall);
		}

		if (neighbors_of(x, y, blocks.stone) + neighbors_of(x, y, blocks.stone_thick) > 4)
			set_stone(x, y, 0.4);

		if (get(x, y) == blocks.dirt && neighbors_of(x, y, blocks.dirt) > 6)
			set(x, y, blocks.gold);
	}
}

for (var x = 0; x < Width; ++x) {
	var y = 0;
	var y_ground = raycast_down(x, y);
	/* place a tree */
	if (Math.random() < 0.15) {
		if (y_ground > Height / 10)
			set(x, y_ground - 1, blocks.tree);
	} else if (get(x, y_ground) == blocks.dirt) {
		set(x, y_ground - 1, blocks.grass);
	}
}

var grass_blocks = find_all(blocks.grass);
for (var i = 0; i < grass_blocks.length; ++i) {
	if (Math.random() < 0.25)
		set(grass_blocks[i][0], grass_blocks[i][1], blocks.flower);
}

gen_tent(blocks.tent_red, 0);
gen_tent(blocks.tent_blue, Width - 1);

/* the last line shall be bedrock */
for (var x = 0; x < Width; ++x) {
	if (Math.random() < 0.4)
		set(x, Height - 2, blocks.bedrock);
	set(x, Height - 1, blocks.bedrock);
}

/* render the outcome */
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
		default:
			line += "?";
			break;
		};
	}
	print(line);
}
*/

