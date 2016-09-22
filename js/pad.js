var Pad = FlynnPolygon.extend({

    init: function(p, s, world_x, world_y, color){
        this._super(p, color);

        this.scale = s;
        this.world_x = world_x;
        this.world_y = world_y;

        this.setScale(s);
    },


    collide: function(polygon){
        if (!this.visible){
            return false;
        }
        for(i=0, len=this.points.length -2; i<len; i+=2){
            var x = this.points[i] + this.world_x;
            var y = this.points[i+1] + this.world_y;

            if (polygon.hasPoint(x,y)){
                return true;
            }
        }
        return false;
    },

    hasPoint: function(world_x, world_y) {
        return this._super(this.world_x, this.world_x, world_x, world_y);
    },

    update: function(paceFactor) {
    },

    draw: function(ctx, viewport_x, viewport_y){
        ctx.drawPolygon(this, this.world_x - viewport_x, this.world_y - viewport_y);
    }
});