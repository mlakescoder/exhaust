(function () { "use strict";

Game.Fueler = Class.extend({

    FUELER_SPEED_X: .4,
    SHIP_HULL: null,
    SHIP_NOZZLE: null,
    SUCCESSFUL_MATE_DIFF_X: 0.1,
    SUCCESSFUL_MATE_DIFF_Y: 0.2,

    init: function(scale, position){

        this.SHIP_HULL = new Flynn.Polygon(
            Game.points.FUELER,
            null,
            scale,
            position,
            false, // constrained
            true   // is_world
        );


        this.SHIP_NOZZLE = new Flynn.Polygon(
            Game.points.FUELER,
            null,
            scale,
            position,
            false, // constrained
            true   // is_world
            );

        this.SHIP_HULL.dx = this.SHIP_NOZZLE.dx  = this.FUELER_SPEED_X;

        if(Math.random() < 0.5){
            this.SHIP_HULL.dx = this.SHIP_NOZZLE.dx  = -this.SHIP_HULL.dx;
        }
    },

    setLevel: function(level){
        this.FUELER_SPEED_X = this.FUELER_SPEED_X + (.1 * level);
    },

    update: function(paceFactor) {
        this.SHIP_HULL.position.x += this.SHIP_HULL.dx * paceFactor;
        this.SHIP_NOZZLE.position.x += this.SHIP_NOZZLE.dx * paceFactor;

        if (this.SHIP_HULL.position.x < 0){
            this.SHIP_HULL.x = this.SHIP_NOZZLE = 0;
            this.SHIP_HULL.dx  = this.SHIP_NOZZLE.dx = this.FUELER_SPEED_X;
        }

        if (this.SHIP_HULL.position.x > g_.WORLD_WIDTH - 40){
            this.SHIP_HULL.position.x = this.SHIP_NOZZLE.position.x = g_.WORLD_WIDTH - 40;
            this.SHIP_HULL.dx = this.SHIP_NOZZLE.dx = -this.FUELER_SPEED_X;
        }
    },

    render: function(ctx){
        this.SHIP_HULL.render(ctx);
        this.SHIP_NOZZLE.render(ctx);
    },

    is_colliding: function(target_poly) {
        return this.SHIP_HULL.is_colliding(target_poly) || this.SHIP_NOZZLE.is_colliding(target_poly);
    },

    is_mating: function(target_poly) {
        var delta_v_x = Math.abs(target_poly.dx - this.SHIP_NOZZLE.dx);
        var delta_v_y = Math.abs( target_poly.dy - this.SHIP_NOZZLE.dy);

        if ( this.SHIP_NOZZLE.is_colliding(target_poly) &&
             delta_v_x <= this.SUCCESSFUL_MATE_DIFF_X &&
             delta_v_y <= this.SUCCESSFUL_MATE_DIFF_Y) {

            return true;
        }

        return false;
    }
});

}()); // "use strict" wrapper