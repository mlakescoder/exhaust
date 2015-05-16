LaserPodBeamOffset = 10;

var LaserPod = FlynnPolygon.extend({

	init: function(p, s, world_position_v, color){
		this._super(p, color);

		this.scale = s;
		this.world_position_v = world_position_v.clone();
		this.visible = true;

		this.setScale(s);
	},


	collide: function(polygon, world_position_v){
		// Pod collision
		var x, y;
		for(var i=0, len=this.points.length -2; i<len; i+=2){
			x = this.points[i] + this.world_position_v.x;
			y = this.points[i+1] + this.world_position_v.y;

			if (polygon.hasPoint(x,y)){
				return true;
			}
		}

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
			return true;
		}

		return false;
	},

	hasPoint: function(world_x, world_y) {
		return this._super(this.world_position_v.x, this.world_position_v.y, world_x, world_y);
	},

	update: function(paceFactor) {

	},

	draw: function(ctx, viewport_x, viewport_y){
		ctx.drawPolygon(this, this.world_position_v.x - viewport_x, this.world_position_v.y - viewport_y);
		ctx.strokeStyle=FlynnColors.MAGENTA;
		ctx.beginPath();
		ctx.moveTo(
			this.world_position_v.x - viewport_x,
			this.world_position_v.y - viewport_y - LaserPodBeamOffset * this.scale);
		ctx.lineTo(
			this.world_position_v.x - viewport_x,
			0);
		ctx.stroke();
	}
});