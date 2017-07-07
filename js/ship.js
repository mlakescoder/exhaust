var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.Ship = Flynn.Polygon.extend({

    maxX: null,
    maxY: null,

    init: function(points, color, scale, position){
        this._super(
            points,
            color,
            scale,
            position,
            false, // constrained
            true   // is_world
            );

        this.dead = false;
        this.human_on_board = false;
        this.is_landed = false;

        this.vel = {
            x: 0,
            y: 0
        };
    },

    rotate_by: function(angle){
        this.angle += angle;
        this.setAngle(this.angle);
    },

    // render() is performed in super class
});

}()); // "use strict" wrapper