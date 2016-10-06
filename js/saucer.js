if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.Saucer = Flynn.Polygon.extend({

    SAUCER_SPEED_X: 2,
    SAUCER_SPEED_Y_MAX: 0.6,
    SAUCER_CANNON_WARMUP_TICKS: 20,

    init: function(p, s, world_x, world_y, color){
        this._super(p, color);

        this.scale = s;
        this.world_x = world_x;
        this.world_y = world_y;
        this.cannon_warmup_timer = 0;

        this.dx = this.SAUCER_SPEED_X;
        if(Math.random() < 0.5){
            this.dx = -this.dx;
        }
        this.dy = Math.random() * this.SAUCER_SPEED_Y_MAX;
        if(Math.random() < 0.5){
            this.dy = -this.dy;
        }

        this.setScale(s);
    },

    cannonCooldown: function(){
        // Cool the cannon down.  It will need to warm up again before firing.
        this.cannon_warmup_timer = this.SAUCER_CANNON_WARMUP_TICKS;
    },

    cannonIsWarm: function(){
        return(this.cannon_warmup_timer < 0);
    },


    collide: function(polygon){
        var i, len;
        
        for(i=0, len=this.points.length -2; i<len; i+=2){
            var x = this.points[i] + this.world_x;
            var y = this.points[i+1] + this.world_y;

            if (polygon.hasPoint(x,y)){
                return true;
            }
        }
        return false;
    },

    hasPoint: function(world_x, world_y) {
        return this._super(this.world_x, this.world_y, world_x, world_y);
    },

    update: function(paceFactor) {
        this.cannon_warmup_timer -= paceFactor;
        this.world_x += this.dx * paceFactor;
        this.world_y += this.dy * paceFactor;
        if (this.world_x < 0){
            this.world_x = 0;
            this.dx = this.SAUCER_SPEED_X;
        }
        if (this.world_x > g_.WORLD_WIDTH - 40){
            this.world_x = g_.WORLD_WIDTH - 40;
            this.dx = -this.SAUCER_SPEED_X;
        }
        if (this.world_y < 0){
            this.world_y = 0;
            this.dy = Math.random() * this.SAUCER_SPEED_Y_MAX;
        }
        if (this.world_y > g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40){
            this.world_y = g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40;
            this.dy = Math.random() * -this.SAUCER_SPEED_Y_MAX;
        }

    },

    draw: function(ctx, viewport_x, viewport_y){
        ctx.drawPolygon(this, this.world_x - viewport_x, this.world_y - viewport_y);
    }
});