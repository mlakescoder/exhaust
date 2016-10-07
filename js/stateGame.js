//--------------------------------------------
// StateGame class
//    Core gameplay
//--------------------------------------------
if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

// Game globals
g_ = {
    GRAVITY: 0.06,
    ATMOSPHERIC_FRICTION: 0.005,

    SHIP_THRUST: 0.20,
    SHIP_START_ANGLE: 0,
    SHIP_START_DISTANCE_FROM_BASE_EDGE: 70,
    SHIP_ROTATION_SPEED: Math.PI/70,
    SHIP_EXHAUST_RATE: 4,  // Number of exhaust particles to spawn every 60fps frame.
    SHIP_EXHAUST_VELOCITY: 3.0,
    SHIP_EXHAUST_SPREAD: Math.PI/7,
    SHIP_TO_EXHAST_LENGTH: 8,
    SHIP_TO_BOTTOM_LENGTH: 13,
    SHIP_LANDING_MARGIN: 20,
    SHIP_LANDING_VELOCITY_MAX: 2.0, //1.6,
    SHIP_LANDING_LATERAL_VELOCITYMAX: 0.9,
    SHIP_LANDING_ANGLE_MAX: 0.45,
    SHIP_NUM_EXPLOSION_PARTICLES: 60,
    SHIP_EXPLOSION_MAX_VELOCITY: 4.0,
    SHIP_RESPAWN_DELAY_GAME_START_TICKS: 60 * 1.25, // Respawn delay at inital start
    SHIP_RESPAWN_ANIMATION_TICKS: 60 * 1.8,
    SHIP_RESPAWN_DELAY_TICKS: 60 * 3,

    SAUCER_SPAWN_PROBABILIY: 0.03,
    SAUCER_SCALE: 3.5,
    SAUCER_SHOOT_PROBABILITY: 0.05,
    SAUCER_SHOOT_VELOCITY: 4.0,
    SAUCER_SHOOT_LIFE: 60 * 4,
    SAUCER_SHOOT_RANGE: 1000,
    SAUCER_SHOOT_SIZE: 4,
    SAUCER_COLOR: Flynn.Colors.GREEN,

    KAMIKAZE_SPAWN_PROBABILITY: 0.03,
    KAMIKAZE_SCALE: 4,
    KAMIKAZE_COLOR: Flynn.Colors.RED,

    LASER_POD_COLOR: Flynn.Colors.RED,
    LASER_POD_BEAM_COLOR: Flynn.Colors.MAGENTA,
    LASER_POD_SCALE: 3,
    LASER_POD_NUM_EXPLOSION_PARTICLES: 40,
    LASER_POD_EXPLOSION_MAX_VELOCITY: 4.5,
    LASER_POD_SPAWN_PROBABILITY: 0.2,

    POP_UP_TEXT_LIFE: 3 * 60,
    POP_UP_THRUST_PROMPT_TIME: 4 * 60, //2 * 60,
    POP_UP_CANCEL_TIME: 15, // Ticks to remove a pop-up when canceled

    EXTRA_LIFE_SCORE: 6000,

    NUM_STARS: 1000,

    WORLD_WIDTH: 4600,
    WORLD_HEIGHT: 1150,

    MOUNTAIN_WIDTH_MIN: 20,
    MOUNTAIN_WIDTH_MAX: 120,
    MOUNTAIN_HEIGHT_MAX: 200,
    MOUNTAIN_RESCUE_AREA_LEFT: 40,
    MOUNTAIN_RESCUE_AREA_WIDTH: 400,
    MOUNTAIN_RESCUE_AREA_HEIGHT: 60,
    MOUNTAIN_RESCUE_AREA_PAD_POSITION: 40,
    MOUNTAIN_BASE_AREA_WIDTH: 400,
    MOUNTAIN_BASE_AREA_MARGIN: 40,
    MOUNTAIN_BASE_AREA_HEIGHT: 90,
    MOUNTAIN_FLAT_PROBABILITY: 0.8,

    TOWER_SCALE: 4,
    TOWER_START_DISTANCE_FROM_BASE_EDGE: 20,
    LAUNCH_BUILDING_SCALE: 3,
    LAUNCH_BUILDING_DISTANCE_FROM_BASE_EDGE: 140,
    BASE_BUILDING_DISTANCE_FROM_BASE_EDGE: 280,
    BASE_BUILDING_SCALE: 2.5,
    BASE_DOOR_SCALE: 3.0,
    WINDOW_SCALE: 2.5,

    INFO_PANEL_HEIGHT: 90,
    RADAR_MARGIN: 350,
    RADAR_TOP_MARGIN: 3,

    VIEWPORT_SLEW_MAX: 30,

    PAD_SCALE: 4,

    HUMANS_NUM: 3,
    HUMANS_PERFECT_RESCUE_POINTS: 2000,

    POINTS_RESCUED_HUMAN: 1000,
    POINTS_PICK_UP_HUMAN: 100,
    POINTS_SAUCER: 10,
    POINTS_KAMIKAZE: 30,
    POINTS_LASER_POD: 20,

    init: function(){
        this.LEVEL_COMPLETE_MESSAGE_TICKS = 60 * 3.0;
        this.LEVEL_NOTICE_MESSAGE_TICKS = 60 * 2;
        this.LEVEL_BONUS_DELAY_TICKS = 60 * 2;
        this.LEVEL_BONUS_TICKS = this.LEVEL_COMPLETE_MESSAGE_TICKS - this.LEVEL_BONUS_DELAY_TICKS;

        this.SHIP_START_X = this.WORLD_WIDTH - this.MOUNTAIN_BASE_AREA_WIDTH - this.MOUNTAIN_BASE_AREA_MARGIN + this.SHIP_START_DISTANCE_FROM_BASE_EDGE;
        this.SHIP_START_Y = this.WORLD_HEIGHT - this.MOUNTAIN_BASE_AREA_HEIGHT - this.SHIP_TO_BOTTOM_LENGTH;

        this.SAUCER_CANNON_OFFSET = -6 * this.SAUCER_SCALE;

        return this;
    }
}.init();

Game.StateGame = Flynn.State.extend({

    init: function() {
        
        this.center_x = Game.CANVAS_WIDTH/2;
        this.center_y = Game.CANVAS_HEIGHT/2;

        this.ship = new Game.Ship(
            Game.points.LANDER,
            Flynn.Colors.YELLOW,
            2.5, // scale
            {  x: g_.SHIP_START_X,
               y: g_.SHIP_START_Y,
               is_world: true
            }
        );
        this.ship.setAngle(g_.SHIP_START_ANGLE);

        this.gameOver = false;
        this.lives = 3;
        this.lifepolygon = new Flynn.Polygon(
            Game.points.LANDER,
            Flynn.Colors.YELLOW,
            1.2, //scale
            {   x:0, // Will be set when rendering instances
                y:55, 
                is_world:false
            }
        );
        this.lifepolygon.setAngle(0);

        Flynn.mcp.viewport = {
            x: g_.WORLD_WIDTH  - Game.CANVAS_WIDTH, 
            y: g_.WORLD_HEIGHT - Game.CANVAS_HEIGHT
        };

        this.score = 0;
        this.highscore = Flynn.mcp.highscores[0][1];
        this.humans_rescued = 0;
        this.bonusAmount = 0;

        this.stars = [];
        this.mountains = [];
        this.radarMountains = [];
        this.altitude = []; // Altitude of every world column (x locaiton)
        this.slope = [];    // Slope    of every world column (x location)
        this.tangent = [];  // Tangnt   of every world column (x location)

        this.particles = new Game.Particles(this);
        this.projectiles = new Flynn.Projectiles(
            Flynn.Rect(0,0,g_.WORLD_WIDTH, g_.WORLD_HEIGHT), // Projectile bounds
            true // Use world coordinates
            );
        this.pads = [];
        this.structures = [];
        this.humans = [];
        this.saucers = [];
        this.kamikazes = [];
        this.laserPods = [];

        this.level = 0;
        this.spawn_manager = new Game.SpawnManager(this.level);

        this.engine_sound = new Howl({
            src: ['sounds/Engine.ogg','sounds/Engine.mp3'],
            volume: 0.25,
            loop: true,
        });
        this.soundPlayerDie = new Howl({
            src: ['sounds/Playerexplosion2.ogg','sounds/Playerexplosion2.mp3'],
            volume: 0.25,
        });
        this.soundExtraLife = new Howl({
            src: ['sounds/ExtraLife.ogg','sounds/ExtraLife.mp3'],
            volume: 1.00,
        });
        this.soundShipRespawn = new Howl({
            src: ['sounds/ShipRespawn.ogg','sounds/ShipRespawn.mp3'],
            volume: 0.25,
        });
        this.soundSaucerDie = new Howl({
            src: ['sounds/Drifterexplosion.ogg','sounds/Drifterexplosion.mp3'],
            volume: 0.25,
        });
        this.soundSaucerShoot = new Howl({
            src: ['sounds/SaucerShoot.ogg','sounds/SaucerShoot.mp3'],
            volume: 0.25,
        });
        this.soundLaserPod = new Howl({
            src: ['sounds/LaserPod4.ogg','sounds/LaserPod4.mp3'],
            volume: 0.5,
        });
        this.soundLevelAdvance = new Howl({
            src: ['sounds/LevelAdvance2.ogg','sounds/LevelAdvance2.mp3'],
            volume: 0.5,
        });
        this.soundBonus = new Howl({
            src: ['sounds/Bonus.ogg','sounds/Bonus.mp3'],
            volume: 0.5,
        });

        this.engine_is_thrusting = false;

        // Game Clock
        this.gameClock = 0;

        // Radar
        this.radarWidth = Game.CANVAS_WIDTH - g_.RADAR_MARGIN*2;
        this.radarHeight = this.radarWidth * (g_.WORLD_HEIGHT/g_.WORLD_WIDTH);


        // Timers
        Flynn.mcp.timers.add('shipRespawnDelay', g_.SHIP_RESPAWN_DELAY_GAME_START_TICKS, null);  // Start game with a delay (for start sound to finish)
        Flynn.mcp.timers.add('shipRespawnAnimation', 0, null);
        Flynn.mcp.timers.add('levelCompleteMessage', 0, null);
        Flynn.mcp.timers.add('levelNoticeMessage', 0, null);
        Flynn.mcp.timers.add('levelBonusDelay', 0, null);
        Flynn.mcp.timers.add('levelBonus', 0, null);
        this.levelAdvancePending = false;

        // Generate level data
        this.generateLvl();

        // Set initial ship position (hidden; will respawn into world)
        this.resetShip();
        this.hideShip();

        // Pop-up messages
        //this.popUpText = "";
        //this.popUpText2 = null;
        //this.popUpLife = 0;
        //this.popUpThrustPending = true;
    },

    worldToRadar: function(world_x, world_y){
        var radar_x = world_x/g_.WORLD_WIDTH*this.radarWidth+g_.RADAR_MARGIN;
        var radar_y = world_y/g_.WORLD_HEIGHT*this.radarHeight+g_.RADAR_TOP_MARGIN;
        return [radar_x, radar_y];
    },

    generateLvl: function() {
        var margin = 20;
        var seed;
        var i, len;

        switch(this.level){
            case 0:
                seed = 'seed7';
                break;
            case 1:
                seed = 'seed17';
                break;
            default:
                seed = 'seed9';
                break;
            //seed = 'seed8';  // Another potentially useful seed
        }
        var seeded_rng = new Math.seedrandom(seed);

        this.ship.setAngle(g_.SHIP_START_ANGLE);
        this.humans_rescued = 0;
        this.spawn_manager.init(this.level);

        this.stars = [];
        for (i=0; i<g_.NUM_STARS; i++){
            this.stars.push(seeded_rng() * g_.WORLD_WIDTH);
            this.stars.push(seeded_rng() * (g_.WORLD_HEIGHT - g_.MOUNTAIN_HEIGHT_MAX));
        }

        //---------------------
        // Generate mountains
        //---------------------

        this.particles.reset();
        this.projectiles.reset();
        this.mountains = [];
        this.pads = [];
        this.structures = [];
        this.humans = [];
        this.saucers = [];
        this.kamikazes = [];
        this.laserPods = [];
        var mountain_x = 0;

        // Starting point
        this.mountains.push(0);
        this.mountains.push(g_.WORLD_HEIGHT - 1 - seeded_rng() * g_.MOUNTAIN_HEIGHT_MAX);

        // Rescue area
        this.mountains.push(g_.MOUNTAIN_RESCUE_AREA_LEFT);
        this.mountains.push(g_.WORLD_HEIGHT - g_.MOUNTAIN_RESCUE_AREA_HEIGHT);
        this.pads.push(new Flynn.Polygon(
                Game.points.PAD, 
                g_.PAD_SCALE,
                Flynn.Colors.CYAN,
                {   x: g_.MOUNTAIN_RESCUE_AREA_LEFT + g_.MOUNTAIN_RESCUE_AREA_PAD_POSITION,
                    y: g_.WORLD_HEIGHT - g_.MOUNTAIN_RESCUE_AREA_HEIGHT,
                    is_world: true
                }
            ));
        for(i=0; i<g_.HUMANS_NUM; i++){
            this.humans.push(new Game.Human(
                Flynn.Colors.WHITE,
                {  x:g_.MOUNTAIN_RESCUE_AREA_LEFT + g_.MOUNTAIN_RESCUE_AREA_PAD_POSITION + 200 + 20*i,
                   y:g_.WORLD_HEIGHT - g_.MOUNTAIN_RESCUE_AREA_HEIGHT
                },
                this  
            ));
        }

        mountain_x = g_.MOUNTAIN_RESCUE_AREA_LEFT + g_.MOUNTAIN_RESCUE_AREA_WIDTH;
        this.mountains.push(mountain_x);
        this.mountains.push(g_.WORLD_HEIGHT - g_.MOUNTAIN_RESCUE_AREA_HEIGHT);

        // Wilderness
        var last_was_flat = true;
        var mountain_y = 0;
        while(mountain_x < g_.WORLD_WIDTH - g_.MOUNTAIN_WIDTH_MAX - g_.MOUNTAIN_BASE_AREA_WIDTH - g_.MOUNTAIN_BASE_AREA_MARGIN){
            var width = Math.floor(g_.MOUNTAIN_WIDTH_MIN + seeded_rng() * (g_.MOUNTAIN_WIDTH_MAX - g_.MOUNTAIN_WIDTH_MIN));
            mountain_x += width;
            this.mountains.push(mountain_x);
            if (!last_was_flat && seeded_rng()<g_.MOUNTAIN_FLAT_PROBABILITY){
                // Create a flat region; (maintain y from last time)
                last_was_flat = true;
                if (seeded_rng() < g_.LASER_POD_SPAWN_PROBABILITY){
                    this.laserPods.push(new Game.LaserPod(
                        Game.points.LASER_POD,
                        g_.LASER_POD_COLOR,
                        g_.LASER_POD_SCALE,
                        {   x: mountain_x-width/2,
                            y: mountain_y-1,
                            is_world: true
                        },
                        this.level
                    ));
                }
            } else{
                // Create a mountain (slope)
                mountain_y = g_.WORLD_HEIGHT - 1 - seeded_rng() * g_.MOUNTAIN_HEIGHT_MAX;
                last_was_flat = false;
            }
            this.mountains.push(mountain_y);
        }

        // Base Area
        var base_left_x = g_.WORLD_WIDTH - g_.MOUNTAIN_BASE_AREA_WIDTH - g_.MOUNTAIN_BASE_AREA_MARGIN;
        this.mountains.push(base_left_x);
        this.mountains.push(g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT);
        this.pads.push(new Flynn.Polygon(
            Game.points.PAD, 
            g_.PAD_SCALE,
            Flynn.Colors.CYAN,
            {   x: base_left_x + g_.SHIP_START_DISTANCE_FROM_BASE_EDGE,
                y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT,
                is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.BASE_BUILDING,
            Flynn.Colors.CYAN_DK,
            g_.BASE_BUILDING_SCALE,
            {  x: base_left_x + g_.BASE_BUILDING_DISTANCE_FROM_BASE_EDGE,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 1,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.TOWER,
            Flynn.Colors.YELLOW_DK,
            g_.TOWER_SCALE,
            {  x: base_left_x + g_.TOWER_START_DISTANCE_FROM_BASE_EDGE,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT -1,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.LAUNCH_BUILDING,
            Flynn.Colors.YELLOW_DK,
            g_.LAUNCH_BUILDING_SCALE,
            {  x: base_left_x + g_.LAUNCH_BUILDING_DISTANCE_FROM_BASE_EDGE,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT -1,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.WINDOW,
            Flynn.Colors.YELLOW_DK,
            g_.WINDOW_SCALE,
            {  x: base_left_x + g_.LAUNCH_BUILDING_DISTANCE_FROM_BASE_EDGE - 5,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 32,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.WINDOW,
            Flynn.Colors.YELLOW_DK,
            g_.WINDOW_SCALE,
            {  x: base_left_x + g_.LAUNCH_BUILDING_DISTANCE_FROM_BASE_EDGE +44,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 8,
               is_world: true
            }
        ));

        this.structures.push(new Flynn.Polygon(
            Game.points.BASE_DOOR,
            Flynn.Colors.CYAN_DK,
            g_.BASE_DOOR_SCALE,
            {  x: base_left_x + g_.BASE_BUILDING_DISTANCE_FROM_BASE_EDGE,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 1,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.WINDOW,
            Flynn.Colors.CYAN_DK,
            g_.WINDOW_SCALE,
            {  x: base_left_x + g_.BASE_BUILDING_DISTANCE_FROM_BASE_EDGE - 32,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 8,
               is_world: true
            }
        ));
        this.structures.push(new Flynn.Polygon(
            Game.points.WINDOW,
            Flynn.Colors.CYAN_DK,
            g_.WINDOW_SCALE,
            {  x: base_left_x + g_.BASE_BUILDING_DISTANCE_FROM_BASE_EDGE + 20,
               y: g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT - 8,
               is_world: true
            }
        ));

        this.mountains.push(g_.WORLD_WIDTH - g_.MOUNTAIN_BASE_AREA_MARGIN);
        this.mountains.push(g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT);
        this.mountains.push(g_.WORLD_WIDTH);
        this.mountains.push(g_.WORLD_HEIGHT - 1 - seeded_rng() * g_.MOUNTAIN_HEIGHT_MAX);

        // Calculate altitude and slope of mountain at every world x coordinate
        this.altitude = [];
        this.slope = [];
        var previous_y = this.mountains[1];
        var previous_x = 0;
        for(i=2, len=this.mountains.length; i<len; i+=2){
            var run = this.mountains[i] - previous_x;
            var rise = this.mountains[i+1] - previous_y;
            var slope = rise/run;
            var tangent = Math.atan(slope) + Math.PI/2;  // Angle of tangent vector pointing out of mountain
            var current_y = previous_y;
            for (var j = 0; j<run; j++){
                this.altitude.push(current_y-4);
                this.slope.push(slope);
                this.tangent.push(tangent);
                current_y+=slope;
            }
            previous_x = this.mountains[i];
            previous_y = this.mountains[i+1];
        }


        // Calculate radar plot of mountains
        this.radarMountains =[];
        for(i=0, len=this.mountains.length; i<len; i+=2){
            this.radarMountains.push(this.mountains[i]/g_.WORLD_WIDTH*this.radarWidth+g_.RADAR_MARGIN);
            this.radarMountains.push(this.mountains[i+1]/g_.WORLD_HEIGHT*this.radarHeight+g_.RADAR_TOP_MARGIN);
        }

        Flynn.mcp.timers.set('levelNoticeMessage', g_.LEVEL_NOTICE_MESSAGE_TICKS);
        
        Flynn.mcp.viewport = {
            x: g_.WORLD_WIDTH - Game.CANVAS_WIDTH, 
            y: g_.WORLD_HEIGHT - Game.CANVAS_HEIGHT
        };

        this.levelAdvancePending = false;
    },

    addPoints: function(points, unconditional){
        // Points only count when not visible, unless unconditional
        // Unconditional is used for bonuses,etc. Which may be applied when not visible.
        if(this.ship.visible || unconditional){
            if(Math.floor(this.score / g_.EXTRA_LIFE_SCORE) !== Math.floor((this.score + points) / g_.EXTRA_LIFE_SCORE)){
                // Extra life
                this.lives++;
                this.soundExtraLife.play();
            }
            this.score += points;
        }

        // Update highscore if exceeded
        if (this.score > this.highscore){
            this.highscore = this.score;
        }
    },

    showPopUp: function(popUpText, popUpText2){
        if(typeof(popUpText2)==='undefined'){
            popUpText2 = null;
        }

        this.popUpText = popUpText;
        this.popUpText2 = popUpText2;
        this.popUpLife = g_.POP_UP_TEXT_LIFE;
    },

    resetShip: function(){
        this.ship.position.x = g_.SHIP_START_X;
        this.ship.position.y = g_.SHIP_START_Y;
        this.ship.setAngle(g_.SHIP_START_ANGLE);
        this.ship.vel.x = 0;
        this.ship.vel.y = 0;
        this.ship.visible = true;
    },

    hideShip: function(){
        // Hide (but don't kill) the ship.
        // Used for idle time during level advancement.
        this.engine_sound.stop();
        this.engine_is_thrusting = false;
        this.ship.visible = false;
    },

    doShipDie: function(){
        // Visibility
        this.ship.visible = false;

        // Lives
        this.lives--;
        if(this.lives <= 0){
            this.gameOver = true;
            Flynn.mcp.timers.set('levelCompleteMessage', 0);
            Flynn.mcp.timers.set('levelBonusDelay', 0);
            Flynn.mcp.timers.set('levelBonus', 0);

        }

        // Sounds
        this.engine_sound.stop();
        this.soundPlayerDie.play();

        // Explosion
        this.particles.explosion(
            this.ship.position.x,
            this.ship.position.y,
            this.ship.vel.x,
            this.ship.vel.y,
            g_.SHIP_NUM_EXPLOSION_PARTICLES,
            g_.SHIP_EXPLOSION_MAX_VELOCITY,
            Flynn.Colors.YELLOW,
            Game.Particle.prototype.PARTICLE_TYPES.PLAIN);
        this.particles.explosion(
            this.ship.position.x,
            this.ship.position.y,
            this.ship.vel.x,
            this.ship.vel.y,
            g_.SHIP_NUM_EXPLOSION_PARTICLES / 2,
            g_.SHIP_EXPLOSION_MAX_VELOCITY,
            Flynn.Colors.YELLOW,
            Game.Particle.prototype.PARTICLE_TYPES.EXHAUST);
        
        // Timers
        Flynn.mcp.timers.set('shipRespawnDelay', g_.SHIP_RESPAWN_DELAY_TICKS);
        Flynn.mcp.timers.set('shipRespawnAnimation', 0); // Set to zero to deactivate it

        // State flags
        this.ship.human_on_board = false; // Kill the passenger
        this.ship.is_landed = false;
    },

    handleInputs: function(input, paceFactor) {

        if(Flynn.mcp.developerModeEnabled){
            // Metrics toggle
            if (input.virtualButtonIsPressed("dev_metrics")){
                Flynn.mcp.canvas.showMetrics = !Flynn.mcp.canvas.showMetrics;
            }

            // Toggle DEV pacing mode slow mo
            if (input.virtualButtonIsPressed("dev_slow_mo")){
                Flynn.mcp.toggleDevPacingSlowMo();
            }

            // Toggle DEV pacing mode fps 20
            if (input.virtualButtonIsPressed("dev_fps_20")){
                Flynn.mcp.toggleDevPacingFps20();
            }

            // Points
            if (input.virtualButtonIsPressed("dev_add_points")){
                this.addPoints(100);
            }

            // Die
            if (input.virtualButtonIsPressed("dev_die") && this.ship.visible){
                this.doShipDie();
            }

            // Kill Human
            if (input.virtualButtonIsPressed("dev_kill_human")){
                if(this.humans.length){
                    this.humans.splice(0,1);
                }
            }

            // Jump to rescue Pad
            if (input.virtualButtonIsPressed("dev_rescue")){
                this.ship.position.x = this.pads[0].position.x;
                this.ship.position.y = this.pads[0].position.y - 40;
                this.ship.vel.x = 0;
                this.ship.vel.y = 0;
                this.ship.setAngle(g_.SHIP_START_ANGLE);
                Flynn.mcp_viewport.x = this.ship.position.x;
            }

            // Jump to base Pad
            if (input.virtualButtonIsPressed("dev_base")){
                this.ship.position.x = this.pads[1].position.x;
                this.ship.position.y = this.pads[1].position.y - 40;
                this.ship.vel.x = 0;
                this.ship.vel.y = 0;
                this.ship.setAngle(g_.SHIP_START_ANGLE);
                Flynn.mcp_viewport.x = this.ship.position.x - Game.CANVAS_WIDTH;
            }

        }
        
        if(!this.ship.visible){
            if (input.virtualButtonIsPressed("UI_enter")){
                if (this.gameOver){
                    if(Flynn.mcp.browserSupportsTouch){
                        // On touch devices just update high score and go back to menu
                        Flynn.mcp.updateHighScores("NONAME", this.score);

                        Flynn.mcp.nextState = Game.States.MENU;
                    } else {
                        Flynn.mcp.nextState = Game.States.END;
                    }
                    Flynn.mcp.custom.score = this.score;
                    return;
                }
            }
            return;
        }

        if (input.virtualButtonIsDown("rotate left")){
            this.ship.rotate_by(-g_.SHIP_ROTATION_SPEED * paceFactor);
        }
        if (input.virtualButtonIsDown("rotate right")){
            this.ship.rotate_by(g_.SHIP_ROTATION_SPEED * paceFactor);
        }

        if (input.virtualButtonIsDown("thrust")){
            this.thrustHasOccurred = true;
            this.popUpThrustPending = false;
            if(!this.engine_is_thrusting){
                this.engine_sound.play();
                this.engine_is_thrusting = true;
            }
            this.ship.vel.x += Math.cos(this.ship.angle - Math.PI/2) * g_.SHIP_THRUST * paceFactor;
            this.ship.vel.y += Math.sin(this.ship.angle - Math.PI/2) * g_.SHIP_THRUST * paceFactor;
            this.particles.exhaust(
                this.ship.position.x + Math.cos(this.ship.angle + Math.PI/2) * g_.SHIP_TO_EXHAST_LENGTH - 1,
                this.ship.position.y + Math.sin(this.ship.angle + Math.PI/2) * g_.SHIP_TO_EXHAST_LENGTH,
                this.ship.vel.x,
                this.ship.vel.y,
                g_.SHIP_EXHAUST_RATE,
                g_.SHIP_EXHAUST_VELOCITY,
                this.ship.angle + Math.PI/2,
                g_.SHIP_EXHAUST_SPREAD,
                paceFactor
            );

            // Cancel PopUp
            if(this.popUpThrustActive){
                this.popUpLife = Math.min(g_.POP_UP_CANCEL_TIME, this.popUpLife);
            }
        } else {
            if (this.engine_is_thrusting){
                this.engine_sound.stop();
                this.engine_is_thrusting = false;
            }
        }
    },

    update: function(paceFactor) {
        var b, numOusideEnemies, outsideEnemyAngles, ptc;
        var killed;
        var i, j;
        var len, len2;

        this.gameClock += paceFactor;

        if(!this.gameOver){
            this.spawn_manager.update(paceFactor);
        }

        if (this.ship.visible){
            // Update ship
            this.ship.vel.y += g_.GRAVITY * paceFactor;
            this.ship.vel.x *= Math.pow((1-g_.ATMOSPHERIC_FRICTION), paceFactor);
            this.ship.vel.y *= Math.pow((1-g_.ATMOSPHERIC_FRICTION), paceFactor);
            this.ship.position.x += this.ship.vel.x * paceFactor;
            this.ship.position.y += this.ship.vel.y * paceFactor;
            var ground_y = this.altitude[Math.floor(this.ship.position.x)];
            if (this.ship.position.y > ground_y - g_.SHIP_TO_BOTTOM_LENGTH){
                this.ship.position.y = ground_y - g_.SHIP_TO_BOTTOM_LENGTH;
                var landed=false;
                // Crash or land
                for(i=0, len=this.pads.length; i<len; i++){
                    var distance_to_center = Math.abs(this.ship.position.x - this.pads[i].position.x);
                    var landing_vel = this.ship.vel.y;
                    var lateral_vel_abs = Math.abs(this.ship.vel.x);
                    var landing_angle = Flynn.Util.angleBound2Pi(this.ship.angle);
                    if (landing_vel > 0.3 && Flynn.mcp.developerModeEnabled){
                        console.log("Landing velocity:", landing_vel);
                        console.log("Landing angle:", landing_angle);
                    }
                    if ((distance_to_center <= g_.SHIP_LANDING_MARGIN) &&
                        (landing_vel < g_.SHIP_LANDING_VELOCITY_MAX) &&
                        (lateral_vel_abs < g_.SHIP_LANDING_LATERAL_VELOCITYMAX) &&
                        ( (landing_angle < g_.SHIP_LANDING_ANGLE_MAX) || (landing_angle>Math.PI*2-g_.SHIP_LANDING_ANGLE_MAX))
                        )
                        {
                        this.ship.setAngle(g_.SHIP_START_ANGLE);
                        this.ship.vel.x = 0;
                        landed = true;
                        this.ship.is_landed = true;
                    }
                }
                if(!landed){
                    // Crash
                    this.doShipDie();
                }
                this.ship.vel.y = 0;
            } else if (this.ship.position.y < 30){
                this.ship.position.y = 30;
                this.ship.vel.y = 0;
            }
            if (this.ship.position.x > g_.WORLD_WIDTH - 40){
                this.ship.position.x = g_.WORLD_WIDTH - 40;
                this.ship.vel.x = 0;
            } else if (this.ship.position.x < 40){
                this.ship.position.x = 40;
                this.ship.vel.x = 0;
            }

            if (this.ship.position.y < ground_y - g_.SHIP_TO_BOTTOM_LENGTH - 5){
                this.ship.is_landed = false;
            }

            // Unload passenger
            if(this.ship.is_landed && this.ship.human_on_board && this.ship.position.x > g_.SHIP_START_X - 100){  //TODO: Lazy math
                this.ship.human_on_board = false;
                this.humans.push(new Game.Human(
                    Flynn.Colors.WHITE,
                    this.ship.position.x + 20,
                    g_.WORLD_HEIGHT - g_.MOUNTAIN_BASE_AREA_HEIGHT,
                    this
                    ));
            }
        }
        else{
            // Ship is not visible
            if(!this.gameOver){
                if(Flynn.mcp.timers.hasExpired('shipRespawnDelay')){
                    // Start the respawn animation timer (which also triggers the animation)
                    Flynn.mcp.timers.set('shipRespawnAnimation', g_.SHIP_RESPAWN_ANIMATION_TICKS);
                    this.soundShipRespawn.play();
                }
                if(Flynn.mcp.timers.hasExpired('shipRespawnAnimation')){
                    // Respawn the ship
                    this.resetShip();
                }
            }
        }

        //-------------------
        // Kamikazes
        //-------------------
        // Kamikaze: Spawn
        if (Math.random() < g_.KAMIKAZE_SPAWN_PROBABILITY && this.spawn_manager.spawn_pool.kamikazes > 0) {
            --this.spawn_manager.spawn_pool.kamikazes;
            this.kamikazes.push(new Game.Kamikaze(
                Game.points.MONSTER,
                g_.KAMIKAZE_COLOR,
                g_.KAMIKAZE_SCALE,
                {  x: Math.random() * (g_.WORLD_WIDTH - 200) + 100,
                   y: Math.random() * 50,
                   is_world: true
                }
                ));
        }

        // Kamikaze: Collisions
        for(i=0, len=this.kamikazes.length; i<len; i+=1){
            killed = false;
            // Homing
            if(this.ship.visible){
                this.kamikazes[i].flyToward({x:this.ship.position.x, y:this.ship.position.y});
            }
            // Update
            this.kamikazes[i].update(paceFactor);

            // Check for ship/kamikaze collision
            if(this.ship.visible){
                if(this.kamikazes[i].is_colliding(this.ship)){
                    this.doShipDie();
                    killed = true;
                }
            }
            // Check for exhaust/saucer collision
            var kamikaze_x = this.kamikazes[i].position.x;
            var kamikaze_y = this.kamikazes[i].position.y;
            for(j=0, len2=this.particles.particles.length; j<len2; j++){
                ptc = this.particles.particles[j];
                if(ptc.type === ptc.PARTICLE_TYPES.EXHAUST){
                    if(Flynn.Util.proximal(100, ptc.x, kamikaze_x) && Flynn.Util.proximal(100, ptc.y, kamikaze_y)){
                        if(this.kamikazes[i].hasPoint(ptc.x, ptc.y)){
                            killed = true;
                        }
                    }
                }
            }

            if(killed){
                // Remove Kamikaze
                this.particles.explosion(
                    this.kamikazes[i].position.x,
                    this.kamikazes[i].position.y,
                    this.kamikazes[i].velocity_v.x,
                    this.kamikazes[i].velocity_v.y,
                    g_.SHIP_NUM_EXPLOSION_PARTICLES,
                    g_.SHIP_EXPLOSION_MAX_VELOCITY * 0.6,
                    g_.KAMIKAZE_COLOR,
                    Game.Particle.prototype.PARTICLE_TYPES.PLAIN);
                this.kamikazes.splice(i,1);
                i--;
                len--;
                this.addPoints(g_.POINTS_KAMIKAZE);
                this.soundSaucerDie.play();
            }
        }

        //-------------------
        // Saucers
        //-------------------

        // Saucer: Spawn
        if (Math.random() < g_.SAUCER_SPAWN_PROBABILIY && this.spawn_manager.spawn_pool.saucers > 0) {
            --this.spawn_manager.spawn_pool.saucers;
            this.saucers.push(new Game.Saucer(
                Game.points.SAUCER,
                g_.SAUCER_COLOR,
                g_.SAUCER_SCALE,
                {  x: Math.random() * (g_.WORLD_WIDTH - 200) + 100,
                   y: Math.random() * 30,
                   is_world: true
                }    
            ));
        }

        // Saucer: shoot
        if(this.ship.visible){
            for (i=0, len=this.saucers.length; i<len; i++){
                // Cannon cooldown
                if(this.ship.position.y > this.saucers[i].position.y){
                    // Ship below saucer.  Cool the cannon down.
                    this.saucers[i].cannonCooldown();
                }

                // Shoot
                if(this.saucers[i].cannonIsWarm() && Math.random() < g_.SAUCER_SHOOT_PROBABILITY){
                    var ship_pos_v = new Victor(this.ship.position.x, this.ship.position.y);
                    var saucer_pos_v = new Victor(this.saucers[i].position.x, this.saucers[i].position.y);
                    var distance = ship_pos_v.clone().subtract(saucer_pos_v).magnitude();

                    // If ship within firing range
                    if (distance < g_.SAUCER_SHOOT_RANGE){
                        var solution = Flynn.Util.interceptSolution(
                            new Victor(this.ship.position.x, this.ship.position.y),
                            new Victor(this.ship.vel.x, this.ship.vel.y),
                            new Victor(this.saucers[i].position.x, this.saucers[i].position.y + g_.SAUCER_CANNON_OFFSET),
                            g_.SAUCER_SHOOT_VELOCITY
                            );

                        // If firing solution results in an upward projectile velocity
                        if (solution.velocity_v.y < 0){
                            this.projectiles.add(
                                {  x: this.saucers[i].position.x,
                                   y: this.saucers[i].position.y + g_.SAUCER_CANNON_OFFSET
                                },
                                {  x: solution.velocity_v.x,
                                   y: solution.velocity_v.y
                                },
                                g_.SAUCER_SHOOT_LIFE,
                                g_.SAUCER_SHOOT_SIZE,
                                Flynn.Colors.YELLOW
                            );
                            this.soundSaucerShoot.play();
                        }
                    }
                }
            }
        }

        // Saucer: Collisions
        for(i=0, len=this.saucers.length; i<len; i+=1){
            killed = false;
            this.saucers[i].update(paceFactor);

            // Check for ship/saucer collision
            if(this.ship.visible){
                if(this.saucers[i].is_colliding(this.ship)){
                    this.doShipDie();
                    killed = true;
                }
            }
            // Check for exhaust/saucer collision
            var saucer_x = this.saucers[i].position.x;
            var saucer_y = this.saucers[i].position.y;
            for(j=0, len2=this.particles.particles.length; j<len2; j++){
                ptc = this.particles.particles[j];
                if(ptc.type === ptc.PARTICLE_TYPES.EXHAUST){
                    if(Flynn.Util.proximal(100, ptc.x, saucer_x) && Flynn.Util.proximal(100, ptc.y, saucer_y)){
                        if(this.saucers[i].hasPoint(ptc.x, ptc.y)){
                            killed = true;
                        }
                    }
                }
            }

            if(killed){
                // Remove Saucer
                this.particles.explosion(
                    this.saucers[i].position.x,
                    this.saucers[i].position.y,
                    this.saucers[i].dx,
                    this.saucers[i].dy,
                    g_.SHIP_NUM_EXPLOSION_PARTICLES,
                    g_.SHIP_EXPLOSION_MAX_VELOCITY * 0.6,
                    g_.SAUCER_COLOR,
                    Game.Particle.prototype.PARTICLE_TYPES.PLAIN);
                this.saucers.splice(i,1);
                i--;
                len--;
                this.addPoints(g_.POINTS_SAUCER);
                this.soundSaucerDie.play();
            }
        }

        //-------------------
        // Projectiles
        //-------------------
        this.projectiles.update(paceFactor);
        // Collision detect
        for(i=0, len=this.projectiles.projectiles.length; i<len; i++){
            if(this.ship.visible && this.ship.hasPoint(
                                        this.projectiles.projectiles[i].position.x,
                                        this.projectiles.projectiles[i].position.y)){
                this.doShipDie();
                // Remove projectile
                this.projectiles.projectiles.splice(i, 1);
                len--;
                i--;
            }
        }

        //-------------------
        // PopUps
        //-------------------
        // Life
        var oldPopUpLife = this.popUpLife;
        this.popUpLife -= paceFactor;

        // Expiration
        if ((this.popUpLife <= 0) && (oldPopUpLife > 0)){
            // PopUp Expired
            this.popUpThrustActive = false;
            this.popUpFireActive = false;
        }

        // Generation
        if(this.popUpThrustPending){
            if (this.gameClock >= g_.POP_UP_THRUST_PROMPT_TIME)
            {
                this.popUpThrustPending = false;
                this.popUpThrustActive = true;
                this.showPopUp(Flynn.mcp.custom.thrustPrompt);
                this.popUpLife = g_.POP_UP_TEXT_LIFE;
            }
        }

        // Particles
        this.particles.update(paceFactor);

        // Humans
        for(i=0, len=this.humans.length; i<len; i+=1){
            this.humans[i].update(paceFactor);
            if(!this.humans[i].valid){
                // Remove
                this.humans.splice(i, 1);
                len--;
                i--;
            }
        }

        // Laser Pods
        for(i=0, len=this.laserPods.length; i<len; i+=1){
            var laserPod = this.laserPods[i];
            laserPod.update(paceFactor);
            if (laserPod.state !== laserPod.STATE.DEAD){
                killed = false;

                // Check for Ship/(LaserPod or beam) collision
                if(this.ship.visible){
                    var collisionResult = laserPod.is_colliding(this.ship);
                    switch(collisionResult){
                        case laserPod.COLLISION_RESULT.POD:
                            this.doShipDie();
                            break;
                        case laserPod.COLLISION_RESULT.BEAM:
                            this.doShipDie();
                            this.soundLaserPod.play();
                            break;
                    }
                }

                // Check for exhaust/LaserPod collision
                var laserPod_world_pos_v = laserPod.position;
                for(j=0, len2=this.particles.particles.length; j<len2; j++){
                    ptc = this.particles.particles[j];
                    if(ptc.type === ptc.PARTICLE_TYPES.EXHAUST){
                        if(Flynn.Util.proximal(50, ptc.x, laserPod_world_pos_v.x) && Flynn.Util.proximal(50, ptc.y, laserPod_world_pos_v.y)){
                            if(laserPod.hasPoint(ptc.x, ptc.y)){
                                killed = true;
                            }
                        }
                    }
                }

                if (killed){
                    // Remove LaserPod
                    this.particles.explosion(
                        laserPod.position.x,
                        laserPod.position.y,
                        0,
                        0,
                        g_.LASER_POD_NUM_EXPLOSION_PARTICLES,
                        g_.LASER_POD_EXPLOSION_MAX_VELOCITY * 0.6,
                        g_.LASER_POD_COLOR,
                        Game.Particle.prototype.PARTICLE_TYPES.PLAIN);
                    laserPod.setDead();
                    this.addPoints(g_.POINTS_LASER_POD);
                    this.soundSaucerDie.play();
                }
            }
        }

        //------------------
        // Wave completion
        //------------------
        if(!this.gameOver && this.humans.length === 0 && this.ship.human_on_board === false && !this.levelAdvancePending){
            Flynn.mcp.timers.set('levelCompleteMessage', g_.LEVEL_COMPLETE_MESSAGE_TICKS);
            Flynn.mcp.timers.set('levelBonusDelay', g_.LEVEL_BONUS_DELAY_TICKS);
            this.levelAdvancePending = true;
            this.hideShip();
            this.soundLevelAdvance.play();
        }
        if(Flynn.mcp.timers.hasExpired('levelCompleteMessage')){
            this.level++;
            this.generateLvl();
            this.resetShip();
            this.hideShip();
            Flynn.mcp.timers.set('shipRespawnAnimation', g_.SHIP_RESPAWN_ANIMATION_TICKS);
            this.soundShipRespawn.play();
        }
        if(Flynn.mcp.timers.hasExpired('levelBonusDelay')){
            Flynn.mcp.timers.set('levelBonus', g_.LEVEL_BONUS_TICKS);
            this.soundBonus.play();
            if(this.humans_rescued === g_.HUMANS_NUM){
                this.addPoints(g_.HUMANS_PERFECT_RESCUE_POINTS, true);
                this.bonusAmount = g_.HUMANS_PERFECT_RESCUE_POINTS;
            }
            else{
                this.bonusAmount = 0;
            }
        }

        // Viewport
        var goal_x = this.ship.position.x;
        var goal_y = this.ship.position.y;
        if (!this.ship.visible && !Flynn.mcp.timers.isRunning('shipRespawnDelay') && !this.gameOver && !this.levelAdvancePending){
            // Pan to ship start location after ship death
            goal_x = g_.SHIP_START_X;
            goal_y = g_.SHIP_START_Y;
        }

        var target_viewport_x = goal_x - Game.CANVAS_WIDTH/2;
        if(target_viewport_x < 0){
            target_viewport_x= 0;
        } else if  (target_viewport_x > g_.WORLD_WIDTH - Game.CANVAS_WIDTH){
            target_viewport_x = g_.WORLD_WIDTH - Game.CANVAS_WIDTH;
        }
        var slew = Flynn.Util.minMaxBound(target_viewport_x - Flynn.mcp_viewport.x, -g_.VIEWPORT_SLEW_MAX, g_.VIEWPORT_SLEW_MAX);
        Flynn.mcp_viewport.x += slew;

        var target_viewport_y = goal_y - (Game.CANVAS_HEIGHT-g_.INFO_PANEL_HEIGHT)/2 - g_.INFO_PANEL_HEIGHT;
        if (target_viewport_y < 0 - g_.INFO_PANEL_HEIGHT){
            target_viewport_y = 0 - g_.INFO_PANEL_HEIGHT;
        }
        else if (target_viewport_y> g_.WORLD_HEIGHT - Game.CANVAS_HEIGHT){
            target_viewport_y = g_.WORLD_HEIGHT - Game.CANVAS_HEIGHT;
        }
        slew = Flynn.Util.minMaxBound(target_viewport_y - Flynn.mcp.viewport.y, -g_.VIEWPORT_SLEW_MAX, g_.VIEWPORT_SLEW_MAX);
        Flynn.mcp.viewport.y += slew;

    },

    render: function(ctx){
        var i, len; 

        ctx.clearAll();

        // PopUp Text
        // if(this.popUpLife > 0){
        //     ctx.vectorText();
        //     if(this.popUpText2){
        //         ctx.vectorText()
        //     }
        // }

        // Ship respawn animation
        if(Flynn.mcp.timers.isRunning('shipRespawnAnimation')){
            var animationPercentage = Flynn.mcp.timers.get('shipRespawnAnimation') / g_.SHIP_RESPAWN_ANIMATION_TICKS;
            var sizePercentageStep = 0.005;
            var rotationPercentageStep = 0.1;
            var startRadius = 200 * animationPercentage;
            var numParticles = 100 * (1-animationPercentage);
            var startAngle = Math.PI * 1 * animationPercentage;
            var angleStep = Math.PI * 8 / 100;
            var radiusStep = 2 * animationPercentage;
            ctx.fillStyle=Flynn.Colors.YELLOW;
            for(i=0; i<numParticles; i++){
                var angle = startAngle + i * angleStep;
                var radius = startRadius + radiusStep * i;
                var x = g_.SHIP_START_X + Math.cos(angle) * radius - Flynn.mcp_viewport.x;
                var y = g_.SHIP_START_Y + Math.sin(angle) * radius - Flynn.mcp.viewport.y;
                ctx.fillRect(x,y,2,2);
            }
        }

        // Stars
        ctx.fillStyle="#808080";
        for(i=0, len=this.stars.length; i<len; i+=2){
            ctx.fillRect(
                this.stars[i] - Flynn.mcp_viewport.x,
                this.stars[i+1] - Flynn.mcp.viewport.y,
                2,2);
        }

        // Mountains
        ctx.vectorStart(Flynn.Colors.BROWN);
        ctx.vectorMoveTo(
            this.mountains[0] - Flynn.mcp_viewport.x,
            this.mountains[1] - Flynn.mcp.viewport.y);
        for(i=2, len=this.mountains.length; i<len; i+=2){
            ctx.vectorLineTo(
                this.mountains[i] - Flynn.mcp_viewport.x,
                this.mountains[i+1] - Flynn.mcp.viewport.y);
        }
        ctx.vectorEnd();

        // Particles
        this.particles.draw(ctx, Flynn.mcp_viewport.x, Flynn.mcp.viewport.y);

        // Pads
        for(i=0, len=this.pads.length; i<len; i+=1){
            this.pads[i].render(ctx);
        }

        // Structures
        for(i=0, len=this.structures.length; i<len; i+=1){
            this.structures[i].render(ctx);
        }

        // Humans
        for(i=0, len=this.humans.length; i<len; i+=1){
            this.humans[i].render(ctx);
        }

        // Saucers
        for(i=0, len=this.saucers.length; i<len; i+=1){
            this.saucers[i].render(ctx);
        }

        // Kamikazes
        for (i=0, len=this.kamikazes.length; i<len; i++){
            this.kamikazes[i].render(ctx);
        }

        // Laser Pods
        for(i=0, len=this.laserPods.length; i<len; i+=1){
            this.laserPods[i].render(ctx);
        }

        // Player
        this.ship.render(ctx);

        // Projectiles
        this.projectiles.draw(ctx, this.viewport_v);

        //------------
        // Info Panel
        //------------

        // Clear panel area
        ctx.fillStyle=Flynn.Colors.BLACK;
        ctx.fillRect(0, 0, Game.CANVAS_WIDTH, g_.INFO_PANEL_HEIGHT);
        ctx.vectorStart(Flynn.Colors.WHITE);
        ctx.vectorMoveTo(0, g_.INFO_PANEL_HEIGHT + 0.5);
        ctx.vectorLineTo(Game.CANVAS_WIDTH-1, g_.INFO_PANEL_HEIGHT + 0.5);
        ctx.vectorEnd();

        // Scores
        ctx.vectorText(this.score, 3, 15, 15, null, Flynn.Colors.GREEN);
        ctx.vectorText(this.highscore, 3, Game.CANVAS_WIDTH - 6  , 15, 0 , Flynn.Colors.GREEN);

        // Remaining Lives
        for(i=0; i<this.lives; i++){
            this.lifepolygon.position.x = 20+20*i;
            this.lifepolygon.render(ctx);
        }

        if(this.ship.human_on_board){
            ctx.vectorText("PASSENGER", 1, 15, 70, 'left', Flynn.Colors.WHITE);
        }

        //------------
        // Radar
        //------------

        // Console
        ctx.fillStyle=Flynn.Colors.BLACK;
        ctx.fillRect(g_.RADAR_MARGIN,3,this.radarWidth,this.radarHeight);
        ctx.vectorRect(g_.RADAR_MARGIN-1,g_.RADAR_TOP_MARGIN-1,this.radarWidth+2,this.radarHeight+2, Flynn.Colors.WHITE);

        // Mountains
        ctx.vectorStart(Flynn.Colors.BROWN);
        ctx.vectorMoveTo(
            this.radarMountains[0],
            this.radarMountains[1]);
        for(i=2, len=this.radarMountains.length; i<len; i+=2){
            ctx.vectorLineTo(
                this.radarMountains[i],
                this.radarMountains[i+1]);
        }
        ctx.vectorEnd();

        // Humans
        ctx.fillStyle=Flynn.Colors.WHITE;
        for(i=0, len=this.humans.length; i<len; i+=1){
            radar_location = this.worldToRadar(this.humans[i].position.x, this.humans[i].position.y);
            ctx.fillRect(radar_location[0], radar_location[1]-1,2,2);
        }

        // Saucers
        ctx.fillStyle=g_.SAUCER_COLOR;
        for(i=0, len=this.saucers.length; i<len; i+=1){
            radar_location = this.worldToRadar(this.saucers[i].position.x, this.saucers[i].position.y);
            ctx.fillRect(radar_location[0], radar_location[1],2,2);
        }

        // Kamikazes
        ctx.fillStyle=g_.KAMIKAZE_COLOR;
        for(i=0, len=this.kamikazes.length; i<len; i+=1){
            radar_location = this.worldToRadar(this.kamikazes[i].position.x, this.kamikazes[i].position.y);
            ctx.fillRect(radar_location[0], radar_location[1],2,2);
        }

        // LaserPods
        ctx.vectorStart(g_.LASER_POD_BEAM_COLOR);
        for(i=0, len=this.laserPods.length; i<len; i+=1){
            var laserPod = this.laserPods[i];
            
            if(laserPod.state === laserPod.STATE.DROPPING){
                ctx.fillStyle=g_.LASER_POD_COLOR;
                radar_location = this.worldToRadar(laserPod.position.x, laserPod.position.y);
                ctx.fillRect(radar_location[0]-1, radar_location[1]-3,4,4);
                ctx.fillStyle=Flynn.Colors.WHITE;
                ctx.fillRect(radar_location[0]-1, radar_location[1]-7,4,4);
            }

            if(laserPod.state === laserPod.STATE.ACTIVE){
                ctx.fillStyle=g_.LASER_POD_COLOR;
                radar_location = this.worldToRadar(laserPod.position.x, laserPod.position.y);
                ctx.fillRect(radar_location[0], radar_location[1]-2,2,2);

                radar_location[0] = Math.floor(radar_location[0]) + 1.5;
                ctx.vectorMoveTo(radar_location[0], radar_location[1]-3);
                ctx.vectorLineTo(radar_location[0], g_.RADAR_TOP_MARGIN+2);
            }
        }
        ctx.vectorEnd();

        // Pads
        ctx.fillStyle=Flynn.Colors.CYAN;
        for(i=0, len=this.pads.length; i<len; i+=1){
            radar_location = this.worldToRadar(this.pads[i].position.x, this.pads[i].position.y);
            ctx.fillRect(radar_location[0]-1, radar_location[1],4,2);
        }

        // Ship
        var radar_location;
        if(this.ship.visible){
            radar_location = this.worldToRadar(this.ship.position.x, this.ship.position.y);
            ctx.fillStyle=Flynn.Colors.YELLOW;
            ctx.fillRect(radar_location[0], radar_location[1],2,2);
        }

        // Viewport
        radar_location = this.worldToRadar(Flynn.mcp_viewport.x, Flynn.mcp.viewport.y + g_.INFO_PANEL_HEIGHT);
        var radar_scale = this.radarWidth / g_.WORLD_WIDTH;
        ctx.vectorRect(
            radar_location[0],radar_location[1],
            Game.CANVAS_WIDTH*radar_scale, (Game.CANVAS_HEIGHT - g_.INFO_PANEL_HEIGHT)*radar_scale,
            "#606060");

        //------------
        // Text
        //------------

        // Game Over
        if(this.gameOver){
            ctx.vectorText("GAME OVER", 6, null, 200, null, Flynn.Colors.ORANGE);
            ctx.vectorText("PRESS <ENTER>", 2, null, 250, null, Flynn.Colors.ORANGE);
        }
        if(Flynn.mcp.timers.isRunning('levelCompleteMessage')){
            ctx.vectorText("LEVEL COMPLETED", 4, null, 225, null, Flynn.Colors.ORANGE);
        }
        if(Flynn.mcp.timers.isRunning('levelBonus')){
            ctx.vectorText("PERFECT RESCUE BONUS: " + this.bonusAmount, 2, null, 270, null, Flynn.Colors.ORANGE);
        }
        if(Flynn.mcp.timers.isRunning('levelNoticeMessage')){
            ctx.vectorText("LEVEL " + (this.level+1), 3, null, 250, null, Flynn.Colors.ORANGE);
        }
    }
});