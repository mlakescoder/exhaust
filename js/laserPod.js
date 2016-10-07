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

    init: function(points, color, scale, position, level){
        this._super(
            points,
            color,
            scale,
            position);

        this.world_position_v = world_position_v.clone();
        this.level = level;

        this.parachute_p = new Flynn.Polygon(
                Game.points.PARACHUTE, 
                Flynn.Colors.WHITE,
                scale,
                {
                    x: this.position.x,
                    y: this.position.y,
                    is_world: this.position.is_world,
                }
            );

        this.ground_position = {
            x: this.position.x,
            y: this.position.y
            };
        this.state = this.STATE.ACTIVE;
    },

    setDead: function(){
        this.state = this.STATE.DEAD;
    },

    is_colliding: function(target_poly){
        var x, y;
        var i, len;
        if(this.state !== this.STATE.DEAD){
            // Pod collision
            for(i=0, len=this.points.length -2; i<len; i+=2){
                x = this.points[i] + this.position.x;
                y = this.points[i+1] + this.position.y;

                if (target_poly.hasPoint(x,y)){
                    return this.COLLISION_RESULT.POD;
                }
            }
        }

        if(this.state === this.STATE.ACTIVE){
            // Beam collision
            var left = false;
            var right = false;
            for(i=0, len=target_poly.points.length -2; i<len; i+=2){

                if (target_poly.points[i] + target_poly.position.x < this.position.x){
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

    update: function(paceFactor) {
        switch(this.state){
            case this.STATE.DEAD:
                // Level 1 and greater laserPods can drop to respawn
                if(this.level > 0 && Math.random() < this.DROP_PROBABILITY){
                    this.state = this.STATE.DROPPING;
                    this.position.y = 0;
                }
                break;

            case this.STATE.DROPPING:
                this.position.y += this.DESCENT_VELOCITY * paceFactor;
                if(this.position.y >= this.ground_position_v.y){
                    this.position.y = this.ground_position_v.y;
                    this.state = this.STATE.ACTIVE;
                }
                break;
        }
    },

    render: function(ctx){
        if(this.state !== this.STATE.DEAD){
            // Render laserPod
            this._super(ctx);
        }
        if(this.state === this.STATE.DROPPING){
            // Render parachute
            this.parachute_p.position.y = this.position.y;
            this.parachute_p.render(ctx);
        }
        if(this.state === this.STATE.ACTIVE){
            // Render laser beam
            ctx.vectorStart(Flynn.Colors.MAGENTA);
            ctx.vectorMoveTo(
                this.position.x - Flynn.mcp.viewport.x,
                this.position.y - Flynn.mcp.viewport.y - this.BEAM_OFFSET * this.scale);
            ctx.vectorLineTo(
                this.position.x - Flynn.mcp.viewport.x,
                0);
            ctx.vectorEnd();
        }
    }
});