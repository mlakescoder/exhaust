var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.Saucer = Flynn.Polygon.extend({

    SAUCER_SPEED_X: 2,
    SAUCER_SPEED_Y_MAX: 0.6,
    SAUCER_CANNON_WARMUP_TICKS: 20,

    init: function(points, color, scale, position){
        this._super(
            points,
            color,
            scale,
            position,
            false, // constrained
            true   // is_world
            );

        var v_x = this.SAUCER_SPEED_X;
        if(Math.random() < 0.5){
            v_x = -v_x;
        }
        var v_y = Math.random() * this.SAUCER_SPEED_Y_MAX;
        if(Math.random() < 0.5){
            v_y = -v_y;
        }

        this.velocity = {x:v_x, y:v_y};
    },

    setLevel(level){
        this.SAUCER_CANNON_WARMUP_TICKS = 20 - (level * 1);
        this.SAUCER_SPEED_X = 1.8 + (.2 * level);
        this.SAUCER_CANNON_WARMUP_TICKS = level < 10 ? 20 - level : 10;
    },

    cannonCooldown: function(){
        // Cool the cannon down.  It will need to warm up again before firing.
        this.cannon_warmup_timer = this.SAUCER_CANNON_WARMUP_TICKS;
    },

    cannonIsWarm: function(){
        return(this.cannon_warmup_timer < 0);
    },

    update: function(paceFactor) {
        this.cannon_warmup_timer -= paceFactor;
        this.position.x += this.velocity.x * paceFactor;
        this.position.y += this.dy * paceFactor;
        if (this.position.x < 0){
            this.position.x = 0;
            this.velocity.x = this.SAUCER_SPEED_X;
        }
        if (this.position.x > g_.WORLD_WIDTH - 40){
            this.position.x = g_.WORLD_WIDTH - 40;
            this.velocity.x = -this.SAUCER_SPEED_X;
        }
        if (this.position.y < 0){
            this.position.y = 0;
            this.dy = Math.random() * this.SAUCER_SPEED_Y_MAX;
        }
        if (this.position.y > g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40){
            this.position.y = g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40;
            this.dy = Math.random() * -this.SAUCER_SPEED_Y_MAX;
        }

    },

    // render() is performed in super class
});

}()); // "use strict" wrapper