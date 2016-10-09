var Game = Game || {}; // Create namespace

Game.Kamikaze = Flynn.Polygon.extend({

    init: function(points, color, scale, position){
        this._super(
            points,
            color,
            scale,
            position);

        // Constants
        this.KAMIKAZE_SPEED = 1.5;
        this.KAMIKAZE_FOLLOW_TIMEOUT = 3;
        this.KAMIKAZE_ASCEND_MARGIN = this.KAMIKAZE_SPEED * 3;
        this.KAMIKAZE_MODE = {
            FOLLOW: 0,
            PATROL: 1,
            ASCEND: 2,
        };

        this.velocity = {x:0, y:0};
        this.followTimer = this.KAMIKAZE_FOLLOW_TIMEOUT;
        this.mode = this.KAMIKAZE_MODE.PATROL;
    },

    flyToward: function(target_position){
        var new_velocity_v = new Victor(
            target_position.x - this.position.x, 
            target_position.y - this.position.y);
        new_velocity_v = new_velocity_v.normalize().multiply(new Victor(this.KAMIKAZE_SPEED, this.KAMIKAZE_SPEED));
        this.velocity.x = new_velocity_v.x;
        this.velocity.y = new_velocity_v.y;
        // Set FOLLOW mode.  Will timeout to PATROL mode if another 'flyToward' 
        // is not issued in KAMIKAZE_FOLLOW_TIMEOUT ticks.
        this.mode = this.KAMIKAZE_MODE.FOLLOW;
        this.followTimer = this.KAMIKAZE_FOLLOW_TIMEOUT;
    },

    startPatrolling: function(){
        // Enter patrol mode
        this.mode = this.KAMIKAZE_MODE.PATROL;
        var patrolAngle = Math.random() * Math.PI/4 - Math.PI/8; // Fly right, within in a +/-22.5 degrees to horizontal.
        if(Math.random()<0.5){
            patrolAngle += Math.PI; // Fly left
        }
        this.velocity.x = this.KAMIKAZE_SPEED * Math.cos(patrolAngle);
        this.velocity.y = this.KAMIKAZE_SPEED * Math.sin(patrolAngle);
    },

    update: function(paceFactor) {
        // Update mode
        if(--this.followTimer <= 0){
            if(this.mode === this.KAMIKAZE_MODE.FOLLOW){
                if (this.position.y > g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40 + this.KAMIKAZE_ASCEND_MARGIN){
                    // Lower than mountains, so start ascending (straigt up)
                    this.mode = this.KAMIKAZE_MODE.ASCEND;
                    this.velocity.x = 0;
                    this.velocity.y = -this.KAMIKAZE_SPEED;
                }
                else{
                    // Higher than mountains, so start patrolling
                    this.startPatrolling();
                }
            }
        }
        if(this.mode === this.KAMIKAZE_MODE.ASCEND){
            if (this.position.y < g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40){
                // Above mountains now.  Start patrolling
                this.startPatrolling();
            }
        }

        // Do patrol
        if(this.mode === this.KAMIKAZE_MODE.PATROL){
            if (this.position.x < 0){
                this.position.x = 0;
                this.velocity.x = this.KAMIKAZE_SPEED;
            }
            if (this.position.x > g_.WORLD_WIDTH - 40){
                this.position.x = g_.WORLD_WIDTH - 40;
                this.velocity.x = -this.KAMIKAZE_SPEED;
            }
            if (this.position.y < 0){
                this.position.y = 0;
                this.velocity.y = Math.random() * this.KAMIKAZE_SPEED/2;
            }
            if (this.position.y > g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX - 40){
                this.velocity.y = Math.random() * -this.KAMIKAZE_SPEED/2;
            }
        }
        
        // Update angle to match current velocity vector
        var angle = (new Victor(this.velocity.x, this.velocity.y)).angle() - (Math.PI/2);
        this.setAngle(angle);

        // Add impulse
        this.position.x += this.velocity.x * paceFactor;
        this.position.y += this.velocity.y * paceFactor;
    },

    // render() is performed in super class
});