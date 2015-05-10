var FlynnProjectile= Class.extend({
	init: function(x, y, dx, dy, life, color){

        this.x = x;
        this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.life = life;
		this.color = color;
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
			// Add impulse
			this.x += this.dx * paceFactor;
			this.y += this.dy * paceFactor;
		}
		return isAlive;
	},

	draw: function(ctx, viewport_x, viewport_y) {
		ctx.fillStyle=this.color;
		ctx.fillRect(this.x - viewport_x, this.y - viewport_y, 4, 4);
	}

});

var FlynnProjectiles = Class.extend({

	init: function(){
		this.projectiles=[];
	},

	add: function(x, y, dx, dy, life, color) {
		this.projectiles.push(new FlynnProjectile(
			x,
			y,
			dx,
			dy,
			life,
			color));
	},

	update: function(paceFactor) {
		for(var i=0, len=this.projectiles.length; i<len; i+=1){
			if(!this.projectiles[i].update(paceFactor)){
				// Particle has died.  Remove it
				this.projectiles.splice(i, 1);
				len--;
				i--;
			}
		}
	},

	draw: function(ctx, viewport_x, viewport_y) {
		for(var i=0, len=this.projectiles.length; i<len; i+=1){
			this.projectiles[i].draw(ctx, viewport_x, viewport_y);
		}
	}
});