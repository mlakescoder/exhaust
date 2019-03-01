var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.Saucer = Flynn.Polygon.extend({

    SAUCER_SPEED_X: 2,
    SAUCER_SPEED_Y_MAX: 0.6,
    SAUCER_CANNON_WARMUP_TICKS: 20,
    SAUCER_CANNON_RELOAD_TICKS: 40,

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
        this.bulletCount = 0;
    },

    setLevel(level){
        this.SAUCER_CANNON_WARMUP_TICKS = 20 - (level * 1);
        this.SAUCER_SPEED_X = 1.8 + (.2 * level);
        this.SAUCER_CANNON_WARMUP_TICKS = level < 10 ? 20 - level : 10;
        this.SAUCER_CANNON_COOLDOWN_TICKS = level < 5 ? 5 - level : 0;
        this.RELOAD_COUNT = level < 5 ? 6 + level : 12;
        this.SAUCER_CANNON_RELOAD_TICKS = level < 5 ? 40 - level * 2 : 20;
        this.bulletCount = this.RELOAD_COUNT;
    },

    cannonFired: function() {
        this.bulletCount -= 1;
        if ( this.bulletCount <= 0 ) {
            this.cannon_warmup_timer = this.SAUCER_CANNON_RELOAD_TICKS;
            this.bulletCount = this.RELOAD_COUNT;
            console.log("Reload");
        } else {
            //this.cannon_warmup_timer = this.SAUCER_CANNON_COOLDOWN_TICKS;
        }
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
        this.position.y += this.velocity.y * paceFactor;
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
            this.velocity.y = Math.random() * this.SAUCER_SPEED_Y_MAX;
        }
        if (this.position.y > g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40){
            this.position.y = g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40;
            this.velocity.y = Math.random() * -this.SAUCER_SPEED_Y_MAX;
        }

    },

    // render() is performed in super class
});

}()); // "use strict" wrapper