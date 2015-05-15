# Map Generator
A simple Javascript-based Map Generator for King Arthur's Gold.

## Libraries
To keep things simple this program uses as little libraries as possible.
The only libraries used are:
 - [LodePNG](http://lodev.org/lodepng) for encoding PNGs.
 - [Duktape](http://duktape.org) as Javascript engine.

## Copyright
Copyright (c) 2015 Christian Schäl

## License
See LICENSE.md

## Building
To build the map generator from source you will only need a compiler
which supports C99. In development gcc 4.9.2 was used but other compilers
should work as well.  
Run `make` to build a binary for your current system. To change the build
process edit the `Makefile`.

## Documentation
Plain map generation is very simple using the map generator, you will
only have to create one Javascript-file and run one command. The file
you'll create is the script which generates a map.  
See `Generating` on how to write the script.  
After you created a generator, execute the map generator binary using
`./generate`, and pass the scripts filename as first argument.
Additional arguments are:
 - `-w, --width <int>` to specify the map-width
 - `-h, --height <int>` to specify the map-height
 - `-o, --output <name>` to name the exported PNG
If you, for example, created a generator script called "gen_mountains.js" and want a 140x70 sized map called "mymap.png", you would run `./generate gen_mountains.js -w 140 -h 70 -o mymap.png`.

### 1. Generating
The Javascript environment for scripts comes with a ECMAScript 5/5.1 compilantengine and a few other functions and variables specialized for map generation.
 - `get(x, y)`, which returns the ID of the block at x|y
 - `set(x, y, id)`, which sets the ID of the block at x|y
 - `read(filename)`, which returns the content of a file "filename"
 - `load_file(file)`, which loads another Javascript file
 - `register(r, g, b)`, which registers a block to be used and exported as RGB. Returns an ID for block (r, g, b)
 - `fill(id)`, which fills the whole map with `id`
 - `findall(id)`, which returns an array filled with the coordinates of every block of type `id`
 - `neighbors_of(x, y, id)`, which returns how many neighbors of type `id` are touching block (x, y)
 - `raycast(x, y, dir, ignored`, which returns the position of the block the ray collides with
 - `Width`, how many blocks wide the map is
 - `Height`, how many blocks high the map is

**Note**: `Width` and `Height` are both variables in the Javascript environment, that means they can be read _and_ written. However, it is **highly discouraged** to change these variables as they will not be changed in the native environment! The result may be that too much or, even worse, not enough memory will be allocated, that the PNG encoder produces corrupt or faulty images or that your toaster turns evil and slowly murders every member of your family...

A simple script generating one layer of bedrock under two layers of a random stone type (normal or thick) under one layer of dirt covered with grass.

```javascript
// layers.js

/* Load default blocks */
load_file("base/blocks.js");

/* Set stone block, 33% chance to be thick stone */
function set_stone(x, y) {
    if (Math.random() < 0.33)
        set(x, y, blocks.stone_thick);
    else
        set(x, y, blocks.stone);
}

/* Iterate from 0..Width */
for (var x = 0; x < Width; ++x) {
    /* Set bedrock layer on the very bottom */
    set(x, Height - 1, blocks.bedrock)
    
    /* Two layers of random stone above it */
    set_stone(x, Height - 2);
    set_stone(x, Height - 3);
    
    /* A layer of dirt... */
    set(x, Height - 4, blocks.dirt);
    
    /* ...covered with grass */
    set(x, Height - 5, blocks.grass);
}
```

Now if you run `./generate layers.js -h 20 -o layers.png`, a nice file called layers.png will be created which looks like this: (As real image, not ascii)

    ,,,,,,,,,,,,,,,,,,,,
    ####################
    %%++%++++%+%%+%%%++%
    +%++%%%+%+%+%+%+%%%%
    XXXXXXXXXXXXXXXXXXXX

From this point, you can create very complex generators which can generate hundreds of awesome maps in very little time!

### 2. Algorithms
As said before, `generators/not_so_flatland.js` uses a very slow algorithm to return an array of points that are all connected to each other without any other blocks than air in between them. This iterative floodfill inspired algorithm will later be replaced with a more flexible, native implementation.  

Algorithms that are very likely to become a native implementation:
 - [ ] FloodFill
 - [ ] FloodFill-List
 - [ ] Neighbors
 - [ ] Regions
 - [X] Raycast / Distance
 - [X] Fill
 - [X] FindAll
 - [X] NeighborsOf

Suggestions are highly desired!

#### 2.1 FindAll
`findall(block_id)` is an algorithm that accepts one argument `block_id` and returns a list of coordinates where this block is found. It searches the entire map. The return type is an array filled with subarrays representing coordinates e.g. `[[1, 1], [3, 7], [4, 9]]`. This result means there are 3 blocks with the same ID as argument `block_id` found, the first one on point (1|1), the second one on point (3|7) and the last one on (4|9).

#### 2.2 Fill
`fill(block_id)` simply sets every block on the map to `block_id`. This is useful when starting the generation to set every block to air.

#### 2.3 NeighborsOf
`neighbors_of(x, y, id)` counts how many blocks of type `id` are touching the block at `(x|y)` and returns the result. To count how many blocks any type _but_ `id` are neighbors, one would calculate `8 - neighbors_of(x, y, id)`.

#### 2.4 Raycast
`raycast(x, y, dir, ignored)` iterates over every block in direction `dir` and checks if its type is in the `ignored` list. If it is not, return the blocks position.  
The parameters are:
 - `x`, `y`: Position where to start the raycast.
 - `dir`: -1, 1 for left and right, -2, 2 for up and down
 - `ignored`: An array of blocks which are ignored when iterating over blocks

To, for example, cast a ray downwards to check where the floor begins one would call `raycast(x, 0, 2, [blocks.air]);`.

### 3. Performance
Performance may vary drastically between different scripts and map dimensions. At this point, the map generator scores a pretty good performance, however more complex scripts are often slowing the process down quite much since all algorithms (obviously excluding the native ones) need to be interpreted by the Javascript engine. A goal for later versions is to support as many general algorithms with a native implementation as possible to speed things up without losing control and flexibility.  
An example for a (performance-wise) bad script is `generators/not_so_flatland.js`, it iterates over every block pretty often, uses the slow iterative floodfill algorithm with way to many, slow `contains(array, point)` calls.

