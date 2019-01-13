(function () { "use strict";

Game.Fueler = Flynn.Polygon.extend({

    FUELER_SPEED_X: 1,

    init: function(points, color, scale, position){
        this._super(
            points,
            color,
            scale,
            position,
            false, // constrained
            true   // is_world
            );

        this.dx = this.FUELER_SPEED_X;
        if(Math.random() < 0.5){
            this.dx = -this.dx;
        }
    },

    setLevel(level){
        this.SAUCER_SPEED_X = this.FUELER_SPEED_X + (.1 * level);
    },

    update: function(paceFactor) {
        this.position.x += this.dx * paceFactor;
        if (this.position.x < 0){
            this.position.x = 0;
            this.dx = this.FUELER_SPEED_X;
        }
        if (this.position.x > g_.WORLD_WIDTH - 40){
            this.position.x = g_.WORLD_WIDTH - 40;
            this.dx = -this.FUELER_SPEED_X;
        }
    },

    // render() is performed in super class
});

}()); // "use strict" wrapper