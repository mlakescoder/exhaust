if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

var KamikazeSpeed = 1.5;
var KamikazeFollowTimeout = 3;
var KamikazeAscendMargin = KamikazeSpeed * 3;

var KamikazeMode = {
    FOLLOW: 0,
    PATROL: 1,
    ASCEND: 2,
};

var Kamikaze = FlynnPolygon.extend({

    init: function(p, s, world_position_v, color){
        this._super(p, color);

        this.scale = s;
        this.world_position_v = world_position_v.clone();
        this.velocity_v = new Victor(0, 0);
        this.followTimer = KamikazeFollowTimeout;
        this.mode = KamikazeMode.PATROL;

        this.setScale(s);
    },

    flyToward: function(target_v){
        this.velocity_v = target_v.clone().subtract(this.world_position_v).normalize().multiply(new Victor(KamikazeSpeed, KamikazeSpeed));
        // Set FOLLOW mode.  Will timeout to PATROL mode if another 'flyToward' is not issued in KamikazeFollowTimeout ticks.
        this.mode = KamikazeMode.FOLLOW;
        this.followTimer = KamikazeFollowTimeout;
    },

    collide: function(polygon){
        for(i=0, len=this.points.length -2; i<len; i+=2){
            var x = this.points[i] + this.world_position_v.x;
            var y = this.points[i+1] + this.world_position_v.y;

            if (polygon.hasPoint(x,y)){
                return true;
            }
        }
        return false;
    },

    hasPoint: function(world_x, world_y) {
        return this._super(this.world_position_v.x, this.world_position_v.y, world_x, world_y);
    },

    startPatrolling: function(){
        // Enter patrol mode
        this.mode = KamikazeMode.PATROL;
        var patrolAngle = Math.random() * Math.PI/4 - Math.PI/8; // Fly right, within in a +/-22.5 degrees to horizontal.
        if(Math.random()<0.5){
            patrolAngle += Math.PI; // Fly left
        }
        this.velocity_v.x = KamikazeSpeed * Math.cos(patrolAngle);
        this.velocity_v.y = KamikazeSpeed * Math.sin(patrolAngle);
    },

    update: function(paceFactor) {
        // Update mode
        if(--this.followTimer <= 0){
            if(this.mode === KamikazeMode.FOLLOW){
                if (this.world_position_v.y > WorldHeight - MountainHeightMax - 40 + KamikazeAscendMargin){
                    // Lower than mountains, so start ascending (straigt up)
                    this.mode = KamikazeMode.ASCEND;
                    this.velocity_v.x = 0;
                    this.velocity_v.y = -KamikazeSpeed;
                }
                else{
                    // Higher than mountains, so start patrolling
                    this.startPatrolling();
                }
            }
        }
        if(this.mode === KamikazeMode.ASCEND){
            if (this.world_position_v.y < WorldHeight - MountainHeightMax - 40){
                // Above mountains now.  Start patrolling
                this.startPatrolling();
            }
        }

        // Do patrol
        if(this.mode === KamikazeMode.PATROL){
            if (this.world_position_v.x < 0){
                this.world_position_v.x = 0;
                this.velocity_v.x = KamikazeSpeed;
            }
            if (this.world_position_v.x > WorldWidth - 40){
                this.world_position_v.x = WorldWidth - 40;
                this.velocity_v.x = -KamikazeSpeed;
            }
            if (this.world_position_v.y < 0){
                this.world_position_v.y = 0;
                this.velocity_v.y = Math.random() * KamikazeSpeed/2;
            }
            if (this.world_position_v.y > WorldHeight - MountainHeightMax - 40){
                this.velocity_v.y = Math.random() * -KamikazeSpeed/2;
            }
        }
        
        // Update angle to match current velocity vector
        var angle = this.velocity_v.angle() - (Math.PI/2);
        this.setAngle(angle);

        // Add impulse
        this.world_position_v.x += this.velocity_v.x * paceFactor;
        this.world_position_v.y += this.velocity_v.y * paceFactor;
    },

    draw: function(ctx, viewport_v){
        ctx.drawPolygon(this, this.world_position_v.x - viewport_v.x, this.world_position_v.y - viewport_v.y);
    }
});