var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.Particle = Class.extend({
    PARTICLE_LIFE: 150,
    PARTICLE_LIFE_VARIATION: 20,
    EXHAUST_LIFE: 150,
    EXHAUST_LIFE_VARIATION: 30,
    EXHAST_BOUNCE_DECAY: 0.4,
    PARTICLE_FRICTION: 0.99,
    PARTICLE_GRAVITY: 0.06,

    PARTICLE_TYPES: {
        PLAIN:     1,
        EXHAUST:   2,
    },

    init: function(particles, x, y, dx, dy, color, type, gameState){
        this.particles = particles;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.type = type;
        this.gameState = gameState;

        if(type == this.PARTICLE_TYPES.EXHAUST){
            this.life = this.EXHAUST_LIFE + (Math.random()-0.5) * this.EXHAUST_LIFE_VARIATION;
        } else {
            this.life = this.PARTICLE_LIFE + (Math.random()-0.5) * this.PARTICLE_LIFE_VARIATION;
        }
    },

    update: function(paceFactor) {
        var altitude;
        var isAlive = true;
        // Decay and die
        this.life -= paceFactor;
        if(this.life <= 0){
            // Kill particle
            isAlive = false;
        }
        else{
            // Gravity
            this.dy += this.PARTICLE_GRAVITY * paceFactor;
            // Add impulse
            this.x += this.dx * paceFactor;
            this.y += this.dy * paceFactor;
            // Decay impulse
            this.dx *= Math.pow(this.PARTICLE_FRICTION, paceFactor);
            this.dy *= Math.pow(this.PARTICLE_FRICTION, paceFactor);

            // Mountain colision
            altitude = this.gameState.altitude[Math.floor(this.x)];
            if (this.y > altitude){
                this.y = altitude;
                if (this.dy > 0){
                    var angle = Math.atan2(this.dy, this.dx);
                    var magnitude = Math.sqrt(this.dy * this.dy + this.dx * this.dx);
                    var tangent = this.gameState.tangent[Math.floor(this.x)];
                    var new_angle = tangent + (tangent - (angle + Math.PI));
                    this.dx = Math.cos(new_angle) * magnitude * this.EXHAST_BOUNCE_DECAY;
                    this.dy = Math.sin(new_angle) * magnitude * this.EXHAST_BOUNCE_DECAY;
                    //this.dy = -this.dy * this.EXHAST_BOUNCE_DECAY;
                }
            }
        }
        return isAlive;
    },

    render: function(ctx) {
        if(this.type == this.PARTICLE_TYPES.PLAIN){
            ctx.fillStyle=this.color;
        } else {
            //ctx.fillStyle=FlynnColors.RED;
            var red = 254 * (this.life / this.EXHAUST_LIFE);
            red = Math.floor(red);
            if(red<0){
                red = 0;
            }
            var green = red - 150;
            if(green<0){
                green = 0;
            }
            ctx.fillStyle = Flynn.Util.rgbToHex(red, green, 0);
        }
        //console.log(this.x, this.y);
        ctx.fillRect(
            this.x - Flynn.mcp.viewport.x,
            this.y - Flynn.mcp.viewport.y,
            2,2);
    }

});

Game.Particles = Class.extend({
    EXHAUST_VELOCITY_VARIATION_FACTOR: 0.1,

    init: function(gameState){
        this.particles=[];
        this.gameState = gameState;
        this.fractionalExhaustParticles = 0;
    },

    reset: function(){
        this.init(this.gameState);
    },

    explosion: function(x, y, dx, dy, quantity, max_velocity, color, particle_type) {
        var theta, velocity;

        for(var i=0; i<quantity; i++){
            theta = Math.random() * Math.PI * 2;
            velocity = Math.random() * max_velocity;
            this.particles.push(new Game.Particle(
                this,
                x,
                y,
                Math.cos(theta) * velocity + dx,
                Math.sin(theta) * velocity + dy,
                color,
                particle_type,
                this.gameState
            ));
        }
    },

    exhaust: function(x, y, dx, dy, particle_rate, velocity, angle, spread, paceFactor){

        // Determine fractional (float) number of particles to spawn.  Remeber remainder (decimal portion)..
        // ..for next call.  Spawn the integer portion.
        var num_particles_float = particle_rate * paceFactor + this.fractionalExhaustParticles;
        var num_particles_int = Math.floor(num_particles_float);
        this.fractionalExhaustParticles = num_particles_float - num_particles_int;

        for(var i=0; i<num_particles_int; i++){
            var theta = angle - (spread/2) + Math.random() * spread;
            var exit_velocity =
                velocity - (velocity * this.EXHAUST_VELOCITY_VARIATION_FACTOR / 2) +
                Math.random() * velocity * this.EXHAUST_VELOCITY_VARIATION_FACTOR;
            var exhaust_dx = Math.cos(theta) * exit_velocity + dx;
            var exhaust_dy = Math.sin(theta) * exit_velocity + dy;
            this.particles.push(new Game.Particle(
                this,
                x - (dx * Math.random() * paceFactor) + (Math.random() * exhaust_dx * paceFactor), // Advance by 1 source frame and jitter by 1 tick in exhaust direction
                y - (dy * Math.random() * paceFactor) + (Math.random() * exhaust_dy * paceFactor), // Advance by 1 source frame and jitter by 1 tick in exhaust direction
                exhaust_dx,
                exhaust_dy,
                null,
                Game.Particle.prototype.PARTICLE_TYPES.EXHAUST,
                this.gameState
            ));
        }
    },

    update: function(paceFactor) {
        var i, len;
        
        for(i=0, len=this.particles.length; i<len; i+=1){
            if(!this.particles[i].update(paceFactor)){
                // Particle has died.  Remove it
                this.particles.splice(i, 1);
                len--;
                i--;
            }
        }
    },

    render: function(ctx) {
        var i, len;

        for(i=0, len=this.particles.length; i<len; i+=1){
            this.particles[i].render(ctx);
        }
    }
});

}()); // "use strict" wrapper