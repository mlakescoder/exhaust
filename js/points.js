var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.points = {
    LANDER: [-1,3,1,3,2,1,3,2,3,5,2,6,4,5,5,3,5,0,2,-4,2,-7,1,-9,0,-10,-1,-9,-2,-7,-2,-4,-5,0,-5,3,-4,5,-2,6,-3,5,-3,2,-2,1,-1,3,-2,4,2,4,1,3,-1,3],
    PAD: [-7,0,7,0,7,1,-7,1,-7,0],
    TOWER: [-2,0,-1,-16,1,-18,7,-18,7,-16,3,-16,2,-15,3,0,-1,0,2,-3,-1,-6,2,-9,-1,-12,2,-15,-1,-15,2,-12,-1,-9,2,-6,-1,-3,2,0,-2,0],
    BASE_BUILDING: [-19,0,-19,-4,-18,-8,-16,-12,-13,-15,-9,-17,-4,-18,4,-18,9,-17,13,-15,16,-12,18,-8,19,-4,19,0,-19,0],
    BASE_DOOR: [3,0,-3,0,-3,-8,3,-8,3,0],
    LAUNCH_BUILDING: [-6,0,-6,-16,-7,-16,-7,-17,-4,-17,-3,-19,1,-19,2,-17,-4,-17,6,-17,7,-23,8,-17,6,-17,11,-17,11,-18,12,-18,12,-17,13,-17,13,-18,14,-18,14,-17,11,-17,16,-17,16,-16,15,-16,15,-10,16,-9,24,-9,24,-8,23,-8,23,0,-6,0],
    SAUCER: [0,6,-1,3,-2,5,-3,2,-5,6,-4,2,-5,1,-4,-2,-4,0,-1,-3,-2,-1,-1,2,-1,0,-2,-1,0,-2,2,-1,1,2,1,0,2,-1,1,-3,4,0,4,-2,5,1,4,2,5,6,3,2,2,5,1,3,0,6],
    MONSTER: [0,-1,-1,-2,-2,-1,-2,-3,-1,-4,-3,-5,-3,-1,-4,1,-2,0,-3,3,-1,1,0,3,1,1,3,3,2,0,4,1,3,-1,3,-5,1,-4,2,-3,2,-1,1,-2,0,-1],
    KAMIKAZE: [0,-9,-2,-5,-1,-3,-2,-2,-2,-1,-1,0,-4,3,0,1,4,3,1,0,2,-1,2,-2,1,-3,2,-5,0,-9],
    FUELER: [9000,8005,0,-6,-2,-2,-3,-3,-3,1,-6,-1,-9,3,-6,2,-5,4,0,3,5,4,6,2,9,3,6,-1,3,1,3,-3,2,-2,0,-6,9000,7000,1,-2,9000,8004,-1,-2,-1,0,1,0,-1,0,-1,0,-1,2,9000,7000,-5,4,9000,8006,-1,5,0,4,1,5,5,4],
    TREE_BASE: [1,0,-1,0,-1,-2,1,-2,1,0],
    TREE_TOP: [4,0,-4,0,-2,-3,-3,-3,-1,-6,-2,-6,0,-9,2,-6,1,-6,3,-3,2,-3,4,0],
    FUEL_TANK: [-2,-2,-2,0,-4,0,-3,-2,-5,-3,-6,-5,-6,-7,-5,-9,-3,-10,3,-10,5,-9,6,-7,6,-5,5,-3,3,-2,4,0,2,0,2,-2,-2,-2],
    LASER_POD: [4,0,-4,0,-3,-2,-1,-2,-1,-5,-2,-5,-2,-6,-1,-6,-1,-7,-2,-7,-2,-8,-1,-8,-1,-9,1,-9,1,-8,2,-8,2,-7,1,-7,1,-6,2,-6,2,-5,1,-5,1,-2,3,-2,4,0],
    PARACHUTE: [0,-11,-7,-15,-6,-17,-4,-19,-1,-20,1,-20,4,-19,6,-17,7,-15,0,-11,4,-15,7,-15,0,-15,0,-11,0,-15,-4,-15,0,-11,-4,-15,-7,-15],
    WINDOW: [7,0,-2,0,-2,-5,7,-5,7,0,Flynn.PEN_COMMAND,Flynn.PEN_UP,4,-4,1,-1,Flynn.PEN_COMMAND,Flynn.PEN_UP,3,-2,4,-3],
};

}()); // "use strict" wrapper