(function () { "use strict";

Game.Fueler = Class.extend({

    FUELER_SPEED_X: .4,
    SHIP_HULL: null,
    SHIP_NOZZLE: null,
    SUCCESSFUL_MATE_DIFF_X: 0.8,
    SUCCESSFUL_MATE_DIFF_Y: 1.2,

    init: function(scale, position){

        this.SHIP_HULL = new Flynn.Polygon(
            Game.points.FUELER,
            null,
            scale,
            position,
            false, // constrained
            true   // is_world
        );
        this.SHIP_HULL.setBoundingPoly(Game.points.FUELER_COLLISION);
        this.SHIP_HULL.setBoundingPolyVisibility(true);

        this.SHIP_NOZZLE = new Flynn.Polygon(
            Game.points.FUELER_NOZZLE,
            null,
            scale,
            position,
            false, // constrained
            true   // is_world
            );

        this.position = position.clone();
        
        var v_x = this.FUELER_SPEED_X;
        var v_y = 0;

        if(Math.random() < 0.5){
            v_x = -v_x;
        }

        this.SHIP_HULL.setVelocity(v_x,v_y);
        this.SHIP_NOZZLE.setVelocity(v_x,v_y);
        this.velocity = {x:v_x, y:v_y};
    },

    setLevel: function(level){
        this.FUELER_SPEED_X = this.FUELER_SPEED_X + (.1 * level);
    },

    setVelocity: function(velocity) {
        this.velocity = velocity;

        this.SHIP_HULL.setVelocity(velocity.x, velocity.y);
        this.SHIP_NOZZLE.setVelocity(velocity.x, velocity.y);
    },

    setVelocity: function(v_x, v_y) {
        this.velocity.x = v_x;
        this.velocity.y = v_y;

        this.SHIP_HULL.setVelocity(velocity.x, velocity.y);
        this.SHIP_NOZZLE.setVelocity(velocity.x, velocity.y);
    },

    update: function(paceFactor) {

        if ( this.is_docking === false) {
            this.SHIP_HULL.position.x += this.velocity.x * paceFactor;
            this.SHIP_NOZZLE.position.x += this.velocity.x * paceFactor;

            if (this.SHIP_HULL.position.x - Math.abs(this.SHIP_HULL.getSpan().left) < 0){
                this.SHIP_HULL.x = this.SHIP_NOZZLE.x = 0;
                this.setVelocity(this.FUELER_SPEED_X, this.velocity.y);
            }

            if (this.SHIP_HULL.position.x + this.SHIP_HULL.getSpan().right >  g_.WORLD_WIDTH ){
                this.SHIP_HULL.position.x = this.SHIP_NOZZLE.position.x = g_.WORLD_WIDTH - this.SHIP_HULL.getSpan().right;
                this.setVelocity(-this.FUELER_SPEED_X, this.velocity.y);
            }

            this.position = this.SHIP_HULL.position.clone();
        }
    },

    render: function(ctx){
        this.SHIP_HULL.render(ctx);
        this.SHIP_NOZZLE.render(ctx);
    },

    is_colliding: function(target_poly) {
        return this.SHIP_HULL.is_colliding(target_poly) ||
                  ( this.SHIP_NOZZLE.is_colliding(target_poly) &&
                    !this.is_mating(target_poly)  );
    },

    is_mating: function(ship) {
        var delta_v_x = Math.abs(ship.velocity.x - this.velocity.x);
        var delta_v_y = Math.abs( ship.velocity.y - this.velocity.y);

        console.log("MATING V: target(" + ship.velocity.x + "," + ship.velocity.y + "), nozzle(" + this.velocity.x + "," + this.velocity.y +
            ") delta(" + delta_v_x + "," + delta_v_y + ")");


        if ( this.SHIP_NOZZLE.is_colliding(ship) &&
             delta_v_x <= this.SUCCESSFUL_MATE_DIFF_X &&
             delta_v_y <= this.SUCCESSFUL_MATE_DIFF_Y) {

            console.log("  MATE_GOOD");
            return true;
        }

        console.log("  MATE_BAD");
        return false;
    },

    setDocking: function(value) {
        this.is_docking = value;
    },

    hasPoint: function(x, y) {
        var contactingHull = this.SHIP_HULL.hasPoint(x,y);
        var contactingNozzle = this.SHIP_NOZZLE.hasPoint(x,y);

        if ( contactingHull || contactingNozzle ) {
            console.log("Contacting hull:" + contactingHull + " nozzle:" + contactingNozzle);
            return true;
        }

        return  false ;
    }
});

}()); // "use strict" wrapper
