var FlynnProjectile= Class.extend({
	init: function(world_position_v, velocity_v, lifetime, size, color){

        this.world_position_v = world_position_v.clone();
        this.velocity_v = velocity_v.clone();
		this.lifetime = lifetime;
		this.size = size;
		this.color = color;
	},

	kill: function(){
		// Mark this projectile dead.  It will be removed on the next update of FlynnProjectiles.
		this.lifetime = 0;
	},

	update: function(paceFactor) {
		var isAlive = true;

		// Decay and die
		this.lifetime -= paceFactor;
		if(this.lifetime <= 0){
			// Kill particle
			isAlive = false;
		}
		else{
			// Add impulse
			this.world_position_v.x += this.velocity_v.x * paceFactor;
			this.world_position_v.y += this.velocity_v.y * paceFactor;
		}
		return isAlive;
	},

	draw: function(ctx, viewport_v) {
		ctx.fillStyle=this.color;
		ctx.fillRect(
			this.world_position_v.x - viewport_v.x,
			this.world_position_v.y - viewport_v.y,
			this.size,
			this.size);
	}

});

var FlynnProjectiles = Class.extend({

	init: function(){
		this.projectiles=[];
	},

	add: function(world_position_v, velocity_v, lifetime, size, color) {
		this.projectiles.push(new FlynnProjectile(
			world_position_v, velocity_v, lifetime, size, color));
	},

	advanceFrame: function() {
		// Advance the newest projectile one frame.  
		this.projectiles[this.projectiles.length-1].update(1.0);
	},

	update: function(paceFactor) {
		for(var i=0, len=this.projectiles.length; i<len; i+=1){
			if(!this.projectiles[i].update(paceFactor)){
				// Projectile has died.  Remove it
				this.projectiles.splice(i, 1);
				len--;
				i--;
			}
		}
	},

	draw: function(ctx, viewport_v) {
		for(var i=0, len=this.projectiles.length; i<len; i+=1){
			this.projectiles[i].draw(ctx, viewport_v);
		}
	}
});