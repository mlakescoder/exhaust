if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.Saucer = Flynn.Polygon.extend({

    SAUCER_SPEED_X: 2,
    SAUCER_SPEED_Y_MAX: 0.6,
    SAUCER_CANNON_WARMUP_TICKS: 20,

    init: function(points, color, scale, position){
        this._super(
            points,
            color,
            scale,
            position);

        this.dx = this.SAUCER_SPEED_X;
        if(Math.random() < 0.5){
            this.dx = -this.dx;
        }
        this.dy = Math.random() * this.SAUCER_SPEED_Y_MAX;
        if(Math.random() < 0.5){
            this.dy = -this.dy;
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
        this.position.x += this.dx * paceFactor;
        this.position.y += this.dy * paceFactor;
        if (this.position.x < 0){
            this.position.x = 0;
            this.dx = this.SAUCER_SPEED_X;
        }
        if (this.position.x > g_.WORLD_WIDTH - 40){
            this.position.x = g_.WORLD_WIDTH - 40;
            this.dx = -this.SAUCER_SPEED_X;
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