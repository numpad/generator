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

### Generating
The Javascript environment for scripts comes with a ECMAScript 5/5.1 compilantengine and a few other functions and variables specialized for map generation.
 - get(x, y), which returns the ID of the block at x|y
 - set(x, y, id), which sets the ID of the block at x|y
 - read(filename), which returns the content of a file "filename"
 - load_file(file), which loads another Javascript file
 - register(r, g, b), which registers a block to be used and exported as RGB. Returns an ID for block (r, g, b)
- Width, how many blocks wide the map is
- Height, how many blocks high the map is

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

## Performance
Performance may vary drastically between different scripts and map dimensions. At this point, the map generator has pretty good performance, however more complex scripts are often slowing the process down quite much since all algorithms need to be interpreted. A goal for later versions is to support general algorithms with a native implementation to speed things up without losing control and flexibility.  
An example for a (performance-wise) bad script is `generators/not_so_flatland.js`, it iterates over every block pretty often, uses the slow iterative floodfill algorithm with way to many, slow `contains(array, point)` calls.

## Algorithms
As said before, `generators/not_so_flatland.js` uses a very slow algorithm to return an array of points that are all connected to each other without any other blocks than air in between them. This iterative floodfill inspired algorithm will later be replaced with a more flexible, native implementation.  

Algorithms that are very likely to become a native implementation:
 - FloodFill
 - FloodFill-List
 - Neighbors
 - FindAll-List
 - FindAllOfType-List
 - Fill / SetAll
 - Raycast / Distance

Suggestions are highly desired!


