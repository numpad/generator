
load_file("base/blocks.js");

fill(blocks.air);

set( 0,  5, blocks.dirt);
set( 5,  0, blocks.dirt);
set(10,  5, blocks.dirt);
set( 5, 10, blocks.dirt);

var goal = raycast(5, 5, -1, [blocks.air, blocks.grass]);

print("Collision at: (" + goal[0] + ", " + goal[1] + ")");

