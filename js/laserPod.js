if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.LaserPod = Flynn.Polygon.extend({

    BEAM_OFFSET: 10,
    DESCENT_VELOCITY: 2.5,
    DROP_PROBABILITY: 0.0001,

    STATE: {
        DEAD: 0,
        ACTIVE: 1,
        DROPPING: 2,
    },

    COLLISION_RESULT: {
        NONE: 0,
        POD: 1,
        BEAM: 2,
    },

    init: function(p, s, world_position_v, color, level){
        this._super(p, color);

        this.scale = s;
        this.world_position_v = world_position_v.clone();
        this.level = level;

        this.parachute_p = new Flynn.Polygon(Game.points.PARACHUTE, Flynn.Colors.WHITE);
        this.parachute_p.setScale(s);

        this.ground_position_v = world_position_v.clone();
        this.state = this.STATE.ACTIVE;
        this.setScale(s);
    },

    setDead: function(){
        this.state = this.STATE.DEAD;
    },

    collide: function(polygon, world_position_v){
        var x, y;
        var i, len;
        if(this.state !== this.STATE.DEAD){
            // Pod collision
            for(i=0, len=this.points.length -2; i<len; i+=2){
                x = this.points[i] + this.world_position_v.x;
                y = this.points[i+1] + this.world_position_v.y;

                if (polygon.hasPoint(x,y)){
                    return this.COLLISION_RESULT.POD;
                }
            }
        }

        if(this.state === this.STATE.ACTIVE){
            // Beam collision
            var left = false;
            var right = false;
            for(i=0, len=polygon.points.length -2; i<len; i+=2){
                x = polygon.points[i] + world_position_v.x;

                if (x < this.world_position_v.x){
                    left = true;
                }
                else{
                    right = true;
                }
            }
            if (left && right){
                // Polygon had points on left and right sides of the beam, so it must be hitting the beam.
                return this.COLLISION_RESULT.BEAM;
            }
        }
        return this.COLLISION_RESULT.NONE;
    },

    hasPoint: function(world_x, world_y) {
        return this._super(this.world_position_v.x, this.world_position_v.y, world_x, world_y);
    },

    update: function(paceFactor) {
        switch(this.state){
            case this.STATE.DEAD:
                // Level 1 and greater laserPods can drop to respawn
                if(this.level > 0 && Math.random() < this.DROP_PROBABILITY){
                    this.state = this.STATE.DROPPING;
                    this.world_position_v.y = 0;
                }
                break;

            case this.STATE.DROPPING:
                this.world_position_v.y += this.DESCENT_VELOCITY * paceFactor;
                if(this.world_position_v.y >= this.ground_position_v.y){
                    this.world_position_v.y = this.ground_position_v.y;
                    this.state = this.STATE.ACTIVE;
                }
                break;
        }
    },

    draw: function(ctx, viewport_x, viewport_y){
        if(this.state !== this.STATE.DEAD){
            ctx.drawPolygon(this, this.world_position_v.x - viewport_x, this.world_position_v.y - viewport_y);
        }
        if(this.state === this.STATE.DROPPING){
            ctx.drawPolygon(this.parachute_p, this.world_position_v.x - viewport_x, this.world_position_v.y - viewport_y);
        }
        if(this.state === this.STATE.ACTIVE){
            ctx.vectorStart(Flynn.Colors.MAGENTA);
            ctx.vectorMoveTo(
                this.world_position_v.x - viewport_x,
                this.world_position_v.y - viewport_y - this.BEAM_OFFSET * this.scale);
            ctx.vectorLineTo(
                this.world_position_v.x - viewport_x,
                0);
            ctx.vectorEnd();
        }
    }
});