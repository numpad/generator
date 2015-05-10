
/*
 * All  blocks/entities  to  be  used  in  the map generator.
 * To  add  your  own,  simply  add  a  new  line  and  write:
 * 'blocks.<block_name> = reqister(<red>, <green>, <blue>);',
 * where   <red>,  <green>  and  <blue>  are  the  png  colors
 * used when exporting the map.  The function register returns
 * an ID to internally represent the block.
 */

/* 'blocks.void'
 * This is a special block used in the map generator to represent
 * anything not on the map. (The black border around the map in KAG)
 */
var blocks = [];
blocks.void                     = register(  0,   0,   0);
blocks.air                      = register(165, 189, 200); /* nature */
blocks.dirt                     = register(132,  71,  21);
blocks.dirt_wall                = register( 59,  20,   6);
blocks.stone                    = register(139, 104,  73);
blocks.stone_thick              = register( 66,  72,  75);
blocks.gold                     = register(254, 165,  61);
blocks.bedrock                  = register( 45,  52,  45);
blocks.water                    = register( 46, 129, 166);
blocks.water_dirt               = register( 51,  85, 102);
blocks.grass                    = register(100, 155,  13); /* plants */
blocks.tree                     = register( 13, 103,  34);
blocks.bush                     = register( 91, 126,  24);
blocks.grain                    = register(162, 183,  22);
blocks.flower                   = register(255, 102, 255);
blocks.shark                    = register( 44, 175, 222); /* animals */
blocks.fish                     = register(121, 168, 163);
blocks.bison                    = register(183,  86,  70);
blocks.chicken                  = register(141,  38,  20);
blocks.castle                   = register(100, 113,  96); /* building */
blocks.castle_wall              = register( 49,  52,  18);
blocks.castle_mossy             = register(100, 143,  96);
blocks.castle_mossy_wall        = register( 49,  82,  18);
blocks.wood                     = register(196, 135,  21);
blocks.wood_wall                = register( 85,  42,  17);
blocks.ladder                   = register( 66,  36,  11);
blocks.platform_up              = register(255, 146,  57);
blocks.platform_down            = register(255, 146,  55);
blocks.platform_left            = register(255, 146,  54);
blocks.platform_right           = register(255, 146,  56);
blocks.door_wood                = register(148, 148, 140);
blocks.door_wood_rotated        = register(148, 148, 147);
blocks.door_stone               = register(160, 160, 160);
blocks.door_stone_rotated       = register(160, 160, 159);
blocks.trap                     = register(100, 100, 100);
blocks.spikes                   = register(180,  42,  17);
blocks.hall                     = register(211, 249,  19); /* buildings */
blocks.storage                  = register(217, 255,  23);
blocks.barracks                 = register(217, 218, 255);
blocks.factory                  = register(255, 217,  23);
blocks.tunnel                   = register(243, 217,  25);
blocks.kitchen                  = register(255, 217,  21);
blocks.nursery                  = register(217, 255,  22);
blocks.workbench                = register(0,   255,   0);
blocks.shop                     = register(255, 190, 190);
blocks.shop_knight              = register(255, 190, 190);
blocks.shop_archer              = register(255, 255, 190);
blocks.shop_builder             = register(190, 255, 190);
blocks.shop_vehicle             = register(230, 230, 230);
blocks.shop_boat                = register(200, 190, 255);
blocks.campfire                 = register(251, 226, 139);
blocks.catapult                 = register(103, 229,  16); /* vehicles */
blocks.ballista                 = register(100, 210,  16);
blocks.bow                      = register( 56, 232, 184);
blocks.raft                     = register( 70, 110, 155);
blocks.dinghy                   = register(201, 158, 246);
blocks.longboat                 = register(  0,  51, 255);
blocks.warboat                  = register( 50, 140, 255);
blocks.airship                  = register(255, 175,   0);
blocks.bomber                   = register(255, 190,   0);
blocks.saw                      = register(202, 164, 130); /* items/entities */
blocks.drill                    = register(210, 120,   0);
blocks.trampoline               = register(187,  59, 253);
blocks.lantern                  = register(241, 231, 177);
blocks.crate                    = register(102,   0,   0);
blocks.bucket                   = register(255, 220, 120);
blocks.log                      = register(160, 140,  40);
blocks.boulder                  = register(161, 149, 133);
blocks.arrows                   = register(200, 210,  70);
blocks.arrows_fire              = register(230, 210,  70);
blocks.bolts                    = register(230, 230,  17);
blocks.bomb                     = register(251, 241,  87);
blocks.satchel                  = register(170, 100,   0);
blocks.material_wood            = register(200, 190, 140);
blocks.material_stone           = register(190, 190, 175);
blocks.material_gold            = register(255, 240, 160);
blocks.heart                    = register(255,  40,  80);
blocks.knight                   = register(255,  95,  25);
blocks.archer                   = register( 25, 255, 182);
blocks.mine                     = register(215,  75, 255);
blocks.burger                   = register(205, 142,  75);
blocks.sponge                   = register(220,   0, 180);
blocks.tent_blue                = register(  0, 255, 255); /* blue team specific */
blocks.flag_blue                = register(  0, 200, 200);
blocks.door_wood_blue           = register( 26,  78, 131);
blocks.door_wood_blue_rotated   = register( 26,  78, 130);
blocks.door_stone_blue          = register( 80,  90, 160);
blocks.door_stone_blue_rotated  = register( 80,  90, 159);
blocks.trap_blue                = register( 56,  76, 142);
blocks.tunnel_blue              = register(220, 217,  25);
blocks.trading                  = register(136, 136,  25);
blocks.trading_blue             = register(136, 136,  25);
blocks.mine_blue                = register( 90, 100, 255);
blocks.tent_red                 = register(255,   0,   0); /* red team specific */
blocks.flag_red                 = register(200,   0,   0);
blocks.door_wood_red            = register(148,  27,  27);
blocks.door_wood_red_rotated    = register(148,  27,  26);
blocks.door_stone_red           = register(160,  90,  80);
blocks.door_stone_red_rotated   = register(160,  90,  79);
blocks.trap_red                 = register(142,  56,  68);
blocks.tunnel_red               = register(243, 217,  22);
blocks.trading_red              = register(255, 136,  13);
blocks.mine_red                 = register(255, 160,  90);

/* Your custom blocks/blobs go here */
// blocks.modded_block = register(color_red, color_green, color_blue);


