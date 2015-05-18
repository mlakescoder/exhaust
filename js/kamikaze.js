var KamikazeSpeed = 1.5;

var Kamikaze = FlynnPolygon.extend({

	init: function(p, s, world_position_v, color){
		this._super(p, color);

		this.scale = s;
		this.world_position_v = world_position_v.clone();
		this.velocity_v = new Victor(0, 0);

		this.setScale(s);
	},

	flyToward: function(target_v){
		this.velocity_v = target_v.clone().subtract(this.world_position_v).normalize().multiply(new Victor(KamikazeSpeed, KamikazeSpeed));
		this.angle = this.velocity_v.angle() - (Math.PI/2);
		this.setAngle(this.angle);
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

	update: function(paceFactor) {
		// Add impulse
		this.world_position_v.x += this.velocity_v.x * paceFactor;
		this.world_position_v.y += this.velocity_v.y * paceFactor;
	},

	draw: function(ctx, viewport_v){
		ctx.drawPolygon(this, this.world_position_v.x - viewport_v.x, this.world_position_v.y - viewport_v.y);
	}
});