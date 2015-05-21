var ParticleLife = 150;
var ParticleLifeVariation = 20;
var ExhaustLife = 150;
var ExhaustLifeVariation = 30;
var ExhaustVelocityVariationFactor = 0.1;
var ExhastBounceDecay = 0.4;
var ExhastPositionJitter = 3;
var ParticleFriction = 0.99;
var ParticleGravity = 0.06;

var ParticleTypes = {
    PLAIN:     1,
    EXHAUST:   2,
};

var Particle = Class.extend({
    init: function(particles, x, y, dx, dy, color, type, gameState){
        this.particles = particles;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.type = type;
        this.gameState = gameState;

        if(type == ParticleTypes.EXHAUST){
            this.life = ExhaustLife + (Math.random()-0.5) * ExhaustLifeVariation;
        } else {
            this.life = ParticleLife + (Math.random()-0.5) * ParticleLifeVariation;
        }
    },

    update: function(paceFactor) {
        var isAlive = true;
        // Decay and die
        this.life -= paceFactor;
        if(this.life <= 0){
            // Kill particle
            isAlive = false;
        }
        else{
            // Gravity
            this.dy += ParticleGravity * paceFactor;
            // Add impulse
            this.x += this.dx * paceFactor;
            this.y += this.dy * paceFactor;
            // Decay impulse
            this.dx *= Math.pow(ParticleFriction, paceFactor);
            this.dy *= Math.pow(ParticleFriction, paceFactor);

            // Mountain colision
            altitude = this.gameState.altitude[Math.floor(this.x)];
            if (this.y > altitude){
                this.y = altitude;
                if (this.dy > 0){
                    var angle = Math.atan2(this.dy, this.dx);
                    var magnitude = Math.sqrt(this.dy * this.dy + this.dx * this.dx);
                    var tangent = this.gameState.tangent[Math.floor(this.x)];
                    var new_angle = tangent + (tangent - (angle + Math.PI));
                    this.dx = Math.cos(new_angle) * magnitude * ExhastBounceDecay;
                    this.dy = Math.sin(new_angle) * magnitude * ExhastBounceDecay;
                    //this.dy = -this.dy * ExhastBounceDecay;
                }
            }
        }
        return isAlive;
    },

    draw: function(ctx, viewport_x, viewport_y) {
        if(this.type == ParticleTypes.PLAIN){
            ctx.fillStyle=this.color;
        } else {
            //ctx.fillStyle=FlynnColors.RED;
            var red = 254 * (this.life / ExhaustLife);
            red = Math.floor(red);
            if(red<0){
                red = 0;
            }
            green = red - 150;
            if(green<0){
                green = 0;
            }
            ctx.fillStyle = flynnRgbToHex(red, green, 0);
        }
        //console.log(this.x, this.y);
        ctx.fillRect(this.x - viewport_x,this.y - viewport_y,2,2);
    }

});

var Particles = Class.extend({

    init: function(gameState){
        this.particles=[];
        this.gameState = gameState;
        this.fractionalExhaustParticles = 0;
    },

    explosion: function(x, y, dx, dy, quantity, max_velocity, color, particle_type) {
        for(var i=0; i<quantity; i++){
            theta = Math.random() * Math.PI * 2;
            velocity = Math.random() * max_velocity;
            this.particles.push(new Particle(
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
                velocity - (velocity * ExhaustVelocityVariationFactor / 2) +
                Math.random() * velocity * ExhaustVelocityVariationFactor;
            var exhaust_dx = Math.cos(theta) * exit_velocity + dx;
            var exhaust_dy = Math.sin(theta) * exit_velocity + dy;
            this.particles.push(new Particle(
                this,
                x + Math.random() * -dx, // Jitter start position in opposite of direciton of motion
                y + Math.random() * -dy, // Jitter start position in opposite of direciton of motion
                exhaust_dx,
                exhaust_dy,
                null,
                ParticleTypes.EXHAUST,
                this.gameState
            ));
        }
    },

    update: function(paceFactor) {
        for(var i=0, len=this.particles.length; i<len; i+=1){
            if(!this.particles[i].update(paceFactor)){
                // Particle has died.  Remove it
                this.particles.splice(i, 1);
                len--;
                i--;
            }
        }
    },

    draw: function(ctx, viewport_x, viewport_y) {
        for(var i=0, len=this.particles.length; i<len; i+=1){
            this.particles[i].draw(ctx, viewport_x, viewport_y);
        }
    }
});