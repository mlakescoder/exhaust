SaucerSpeedX = 2;
SaucerSpeedYMax = 0.6;
SaucerCannonWarmupTicks = 20;

var Saucer = FlynnPolygon.extend({

    init: function(p, s, world_x, world_y, color){
        this._super(p, color);

        this.scale = s;
        this.world_x = world_x;
        this.world_y = world_y;
        this.cannon_warmup_timer = 0;

        this.dx = SaucerSpeedX;
        if(Math.random() < 0.5){
            this.dx = -this.dx;
        }
        this.dy = Math.random() * SaucerSpeedYMax;
        if(Math.random() < 0.5){
            this.dy = -this.dy;
        }

        this.setScale(s);
    },

    cannonCooldown: function(){
        // Cool the cannon down.  It will need to warm up again before firing.
        this.cannon_warmup_timer = SaucerCannonWarmupTicks;
    },

    cannonIsWarm: function(){
        return(this.cannon_warmup_timer < 0);
    },


    collide: function(polygon){
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
            this.dx = SaucerSpeedX;
        }
        if (this.world_x > WorldWidth - 40){
            this.world_x = WorldWidth - 40;
            this.dx = -SaucerSpeedX;
        }
        if (this.world_y < 0){
            this.world_y = 0;
            this.dy = Math.random() * SaucerSpeedYMax;
        }
        if (this.world_y > WorldHeight - MountainHeightMax - 40){
            this.world_y = WorldHeight - MountainHeightMax - 40;
            this.dy = Math.random() * -SaucerSpeedYMax;
        }

    },

    draw: function(ctx, viewport_x, viewport_y){
        ctx.drawPolygon(this, this.world_x - viewport_x, this.world_y - viewport_y);
    }
});