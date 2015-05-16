
/*
 * Prints the whole level to the console
 */
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
