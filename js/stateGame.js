//--------------------------------------------
// StateGame class
//    Core gameplay
//--------------------------------------------

var Gravity = 0.06;
var AtmosphericFriction = 0.005;

var ShipThrust = 0.20;
var ShipStartAngle = 0;
var ShipStartDistanceFromBaseEdge = 70;
var ShipRotationSpeed = Math.PI/70;
var ShipExhaustRate = 4;  // Number of exhaust particles to spawn every 60fps frame.
var ShipExhaustVelocity	= 3.0;
var ShipExhaustSpread = Math.PI/7;
var ShipToExhastLength = 8;
var ShipToBottomLength = 13;
var ShipLandingMargin = 20;
var ShipLandingVelocityMax = 2.0; //1.6;
var ShipLandingLateralVelocitymax = 0.9;
var ShipLandingAngleMax = 0.45;
var ShipNumExplosionParticles = 60;
var ShipExplosionMaxVelocity = 4.0;
var ShipRespawnDelayGameStartTicks = 60 * 1.25; // Respawn delay at inital start
var ShipRespawnAnimationTicks = 60 * 1.8;
var ShipRespawnDelayTicks = 60 * 3;

var SaucerSpawnProbabiliy = 0.03;
var SaucerScale = 3.5;
var SaucerShootProbability = 0.05;
var SaucerShootVelocity = 4.0;
var SaucerShootLife = 60 * 4;
var SaucerCannonOffset = -6 * SaucerScale;
var SaucerShootRange = 1000;
var SaucerShootSize = 4;
var SaucerColor = FlynnColors.GREEN;

var KamikazeSpawnProbability = 0.03;
var KamikazeScale = 4;
var KamikazeColor = FlynnColors.RED;

var LaserPodColor = FlynnColors.RED;
var LaserPodBeamColor = FlynnColors.MAGENTA;
var LaserPodScale = 3;
var LaserPodNumExplosionParticles = 40;
var LaserPodExplosionMaxVelocity = 4.5;
var LaserPodSpawnProbability = 0.2;

var PopUpTextLife = 3 * 60;
var PopUpThrustPromptTime = 4 * 60; //2 * 60;
var PopUpCancelTime = 15; // Ticks to remove a pop-up when canceled

var ExtraLifeScore = 20000;

var NumStars = 1000;

var WorldWidth = 4600;
var WorldHeight = 1150;

var MountainWidthMin = 20;
var MountainWidthMax = 120;
var MountainHeightMax = 200;
var MountainRescueAreaLeft = 40;
var MountainRescueAreaWidth = 400;
var MountainRescueAreaHeight = 60;
var MountainRescueAreaPadPosition = 40;
var MountainBaseAreaWidth = 400;
var MountainBaseAreaMargin = 40;
var MountainBaseAreaHeight = 90;
var MountainFlatProbability = 0.8;

var TowerScale = 4;
var TowerStartDistanceFromBaseEdge = 20;
var LaunchBuildingScale = 3;
var LaunchBuildingDistanceFromBaseEdge = 140;
var BaseBuildingDistanceFromBaseEdge = 280;
var BaseBuildingScale = 2.5;
var BaseDoorScale = 3.0;
var WindowScale = 2.5;

var InfoPanelHeight = 90;
var RadarMargin = 350;
var RadarTopMargin = 3;

var ViewportSlewMax = 30;

var PadScale = 4;

var HumansNum = 3;

var ShipStartX = WorldWidth - MountainBaseAreaWidth - MountainBaseAreaMargin + ShipStartDistanceFromBaseEdge;
var ShipStartY = WorldHeight - MountainBaseAreaHeight - ShipToBottomLength;

var PointsRescuedHuman = 1000;
var PointsPickUpHuman = 100;
var PointsSaucer = 10;
var PointsKamikaze = 30;
var PointsLaserPod = 20;


var StateGame = FlynnState.extend({

	init: function(mcp) {
		this._super(mcp);
		
		this.canvasWidth = mcp.canvas.ctx.width;
		this.canvasHeight = mcp.canvas.ctx.height;
		this.center_x = this.canvasWidth/2;
		this.center_y = this.canvasHeight/2;

		this.ship = new Ship(Points.LANDER, 2.5,
			ShipStartX,
			ShipStartY,
			ShipStartAngle, FlynnColors.YELLOW);

		this.ship.visible = true;

		this.gameOver = false;
		this.lives = 3;
		this.lifepolygon = new FlynnPolygon(Points.LANDER, FlynnColors.YELLOW);
		this.lifepolygon.setScale(1.2);
        this.lifepolygon.setAngle(0);

        this.viewport_v = new Victor(WorldWidth - this.canvasWidth, WorldHeight - this.canvasHeight);

		this.score = 0;
		this.highscore = this.mcp.highscores[0][1];
		this.humans_rescued = 0;

		this.stars = [];
		this.mountains = [];
		this.radarMountains = [];
		this.altitude = []; // Altitude of every world column (x locaiton)
		this.slope = [];    // Slope    of every world column (x location)
		this.tangent = [];  // Tangnt   of every world column (x location)

		this.particles = new Particles(this);
		this.projectiles = new FlynnProjectiles(
			new Victor(0,0),                    // Min projectile bounds
			new Victor(WorldWidth, WorldHeight) // Max projectile bounds
			);
		this.pads = [];
		this.structures = [];
		this.humans = [];
		this.saucers = [];
		this.kamikazes = [];
		this.laserPods = [];

		this.lvl = 0;
		this.spawn_manager = new SpawnManager(this.lvl);

		this.engine_sound = new Howl({
			src: ['sounds/Engine.ogg','sounds/Engine.mp3'],
			volume: 0.25,
			loop: true,
		});
		this.player_die_sound = new Howl({
			src: ['sounds/Playerexplosion2.ogg','sounds/Playerexplosion2.mp3'],
			volume: 0.25,
		});
		this.extra_life_sound = new Howl({
			src: ['sounds/ExtraLife.ogg','sounds/ExtraLife.mp3'],
			volume: 1.00,
		});
		this.ship_respawn_sound = new Howl({
			src: ['sounds/ShipRespawn.ogg','sounds/ShipRespawn.mp3'],
			volume: 0.25,
		});
		this.saucer_die_sound = new Howl({
			src: ['sounds/Drifterexplosion.ogg','sounds/Drifterexplosion.mp3'],
			volume: 0.25,
		});
		this.sound_saucer_shoot = new Howl({
			src: ['sounds/SaucerShoot.ogg','sounds/SaucerShoot.mp3'],
			volume: 0.25,
		});
		this.sound_laser_pod = new Howl({
			src: ['sounds/LaserPod4.ogg','sounds/LaserPod4.mp3'],
			volume: 0.5,
		});

		this.engine_is_thrusting = false;

		// Game Clock
		this.gameClock = 0;

		// Radar
		this.radarWidth = this.canvasWidth - RadarMargin*2;
		this.radarHeight = this.radarWidth * (WorldHeight/WorldWidth);

		this.generateLvl();

		// Timers
		this.mcp.timers.add('shipRespawnDelay', ShipRespawnDelayGameStartTicks);  // Start game with a delay (for start sound to finish)
		this.mcp.timers.add('shipRespawnAnimation', 0);


		// Pop-up messages
		//this.popUpText = "";
		//this.popUpText2 = null;
		//this.popUpLife = 0;
		//this.popUpThrustPending = true;
	},

	worldToRadar: function(world_x, world_y){
		var radar_x = world_x/WorldWidth*this.radarWidth+RadarMargin;
		var radar_y = world_y/WorldHeight*this.radarHeight+RadarTopMargin;
		return [radar_x, radar_y];
	},

	generateLvl: function() {
		var margin = 20;
		var seeded_rng = new Math.seedrandom('seed7');

		this.ship.angle = ShipStartAngle;
		this.humans_rescued = 0;

		this.stars = [];
		for (var i=0; i<NumStars; i++){
			this.stars.push(seeded_rng() * WorldWidth);
			this.stars.push(seeded_rng() * (WorldHeight - MountainHeightMax));
		}

		//---------------------
		// Generate mountains
		//---------------------

		this.mountains = [];
		this.pads = [];
		this.structures = [];
		this.humans = [];
		this.saucers = [];
		this.kamikazes = [];
		var mountain_x = 0;

		// Starting point
		this.mountains.push(0);
		this.mountains.push(WorldHeight - 1 - seeded_rng() * MountainHeightMax);

		// Rescue area
		this.mountains.push(MountainRescueAreaLeft);
		this.mountains.push(WorldHeight - MountainRescueAreaHeight);
		this.pads.push(new Pad(Points.PAD, PadScale,
			MountainRescueAreaLeft + MountainRescueAreaPadPosition,
			WorldHeight - MountainRescueAreaHeight,
			FlynnColors.CYAN));
		for(i=0; i<HumansNum; i++){
			this.humans.push(new Human(
				FlynnColors.WHITE,
				MountainRescueAreaLeft + MountainRescueAreaPadPosition + 200 + 20*i,
				WorldHeight - MountainRescueAreaHeight,
				this
				));
		}

		mountain_x = MountainRescueAreaLeft + MountainRescueAreaWidth;
		this.mountains.push(mountain_x);
		this.mountains.push(WorldHeight - MountainRescueAreaHeight);

		// Wilderness
		var last_was_flat = true;
		var mountain_y = 0;
		while(mountain_x < WorldWidth - MountainWidthMax - MountainBaseAreaWidth - MountainBaseAreaMargin){
			var width = Math.floor(MountainWidthMin + seeded_rng() * (MountainWidthMax - MountainWidthMin));
			mountain_x += width;
			this.mountains.push(mountain_x);
			if (!last_was_flat && seeded_rng()<MountainFlatProbability){
				// Create a flat region; (maintain y from last time)
				last_was_flat = true;
				if (seeded_rng() < LaserPodSpawnProbability){
					this.laserPods.push(new LaserPod(
						Points.LASER_POD, LaserPodScale, new Victor(mountain_x-width/2, mountain_y-1), LaserPodColor));
				}
			} else{
				// Create a mountain (slope)
				mountain_y = WorldHeight - 1 - seeded_rng() * MountainHeightMax;
				last_was_flat = false;
			}
			this.mountains.push(mountain_y);
		}

		// Base Area
		var base_left_x = WorldWidth - MountainBaseAreaWidth - MountainBaseAreaMargin;
		this.mountains.push(base_left_x);
		this.mountains.push(WorldHeight - MountainBaseAreaHeight);
		this.pads.push(new Pad(Points.PAD, PadScale,
			base_left_x + ShipStartDistanceFromBaseEdge,
			WorldHeight - MountainBaseAreaHeight,
			FlynnColors.CYAN));
		this.structures.push(new Structure(Points.BASE_BUILDING, BaseBuildingScale,
			base_left_x + BaseBuildingDistanceFromBaseEdge,
			WorldHeight - MountainBaseAreaHeight - 1,
			FlynnColors.CYAN_DK));
		this.structures.push(new Structure(Points.TOWER, TowerScale,
			base_left_x + TowerStartDistanceFromBaseEdge,
			WorldHeight - MountainBaseAreaHeight -1,
			FlynnColors.YELLOW_DK));
		this.structures.push(new Structure(Points.LAUNCH_BUILDING, LaunchBuildingScale,
			base_left_x + LaunchBuildingDistanceFromBaseEdge,
			WorldHeight - MountainBaseAreaHeight -1,
			FlynnColors.YELLOW_DK));
		this.structures.push(new Structure(Points.WINDOW, WindowScale,
			base_left_x + LaunchBuildingDistanceFromBaseEdge - 5,
			WorldHeight - MountainBaseAreaHeight - 32,
			FlynnColors.YELLOW_DK));
		this.structures.push(new Structure(Points.WINDOW, WindowScale,
			base_left_x + LaunchBuildingDistanceFromBaseEdge +44,
			WorldHeight - MountainBaseAreaHeight - 8,
			FlynnColors.YELLOW_DK));

		this.structures.push(new Structure(Points.BASE_DOOR, BaseDoorScale,
			base_left_x + BaseBuildingDistanceFromBaseEdge,
			WorldHeight - MountainBaseAreaHeight - 1,
			FlynnColors.CYAN_DK));
		this.structures.push(new Structure(Points.WINDOW, WindowScale,
			base_left_x + BaseBuildingDistanceFromBaseEdge - 32,
			WorldHeight - MountainBaseAreaHeight - 8,
			FlynnColors.CYAN_DK));
		this.structures.push(new Structure(Points.WINDOW, WindowScale,
			base_left_x + BaseBuildingDistanceFromBaseEdge + 20,
			WorldHeight - MountainBaseAreaHeight - 8,
			FlynnColors.CYAN_DK));

		this.mountains.push(WorldWidth - MountainBaseAreaMargin);
		this.mountains.push(WorldHeight - MountainBaseAreaHeight);
		this.mountains.push(WorldWidth);
		this.mountains.push(WorldHeight - 1 - seeded_rng() * MountainHeightMax);

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
			this.radarMountains.push(this.mountains[i]/WorldWidth*this.radarWidth+RadarMargin);
			this.radarMountains.push(this.mountains[i+1]/WorldHeight*this.radarHeight+RadarTopMargin);
		}

		// this.bullets = [];
	},

	addPoints: function(points){
		// Points only count when not dead
		if(this.ship.visible){
			if(Math.floor(this.score / ExtraLifeScore) != Math.floor((this.score + points) / ExtraLifeScore)){
				// Extra life
				this.lives++;
				this.extra_life_sound.play();
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
		this.popUpLife = PopUpTextLife;
	},

	doShipDie: function(){
		this.ship.dead = true; // Mark the player as dead
		this.ship.human_on_board = false; // Kill the passenger
		this.player_die_sound.play();
		this.particles.explosion(
			this.ship.world_x,
			this.ship.world_y,
			this.ship.vel.x,
			this.ship.vel.y,
			ShipNumExplosionParticles,
			ShipExplosionMaxVelocity,
			FlynnColors.YELLOW,
			ParticleTypes.PLAIN);
		this.particles.explosion(
			this.ship.world_x,
			this.ship.world_y,
			this.ship.vel.x,
			this.ship.vel.y,
			ShipNumExplosionParticles / 2,
			ShipExplosionMaxVelocity,
			FlynnColors.YELLOW,
			ParticleTypes.EXHAUST);
		this.mcp.timers.set('shipRespawnDelay', ShipRespawnDelayTicks);
		this.mcp.timers.set('shipRespawnAnimation', 0); // Set to zero to deactivate it
	},

	handleInputs: function(input, paceFactor) {

		if(this.mcp.developerModeEnabled){
			// Metrics toggle
			if (input.virtualButtonIsPressed("dev_metrics")){
				this.mcp.canvas.showMetrics = !this.mcp.canvas.showMetrics;
			}

			// Toggle DEV pacing mode slow mo
			if (input.virtualButtonIsPressed("dev_slow_mo")){
				this.mcp.toggleDevPacingSlowMo();
			}

			// Toggle DEV pacing mode fps 20
			if (input.virtualButtonIsPressed("dev_fps_20")){
				this.mcp.toggleDevPacingFps20();
			}

			// Points
			if (input.virtualButtonIsPressed("dev_add_points")){
				this.addPoints(100);
			}

			// Die
			if (input.virtualButtonIsPressed("dev_die") && this.ship.visible){
				this.doShipDie();
			}

			// Jump to rescue Pad
			if (input.virtualButtonIsPressed("dev_rescue")){
				this.ship.world_x = this.pads[0].world_x;
				this.ship.world_y = this.pads[0].world_y - 40;
				this.ship.vel.x = 0;
				this.ship.vel.y = 0;
				this.ship.angle = ShipStartAngle;
				this.ship.setAngle(ShipStartAngle);
				this.viewport_v.x = this.ship.world_x;
			}

			// Jump to base Pad
			if (input.virtualButtonIsPressed("dev_base")){
				this.ship.world_x = this.pads[1].world_x;
				this.ship.world_y = this.pads[1].world_y - 40;
				this.ship.vel.x = 0;
				this.ship.vel.y = 0;
				this.ship.angle = ShipStartAngle;
				this.ship.setAngle(ShipStartAngle);
				this.viewport_v.x = this.ship.world_x - this.canvasWidth;
			}

		}
		
		if(!this.ship.visible){
			if (input.virtualButtonIsPressed("UI_enter")){
				if (this.gameOver){
					if(this.mcp.browserSupportsTouch){
						// On touch devices just update high score and go back to menu
						this.mcp.updateHighScores("NONAME", this.score);

						this.mcp.nextState = States.MENU;
					} else {
						this.mcp.nextState = States.END;
					}
					this.mcp.custom.score = this.score;
					return;
				}
			}
			return;
		}

		if (input.virtualButtonIsDown("rotate left")){
			this.ship.rotate_by(-ShipRotationSpeed * paceFactor);
		}
		if (input.virtualButtonIsDown("rotate right")){
			this.ship.rotate_by(ShipRotationSpeed * paceFactor);
		}

		if (input.virtualButtonIsDown("thrust")){
			this.thrustHasOccurred = true;
			this.popUpThrustPending = false;
			if(!this.engine_is_thrusting){
				this.engine_sound.play();
				this.engine_is_thrusting = true;
			}
			this.ship.vel.x += Math.cos(this.ship.angle - Math.PI/2) * ShipThrust * paceFactor;
			this.ship.vel.y += Math.sin(this.ship.angle - Math.PI/2) * ShipThrust * paceFactor;
			this.particles.exhaust(
				this.ship.world_x + Math.cos(this.ship.angle + Math.PI/2) * ShipToExhastLength,
				this.ship.world_y + Math.sin(this.ship.angle + Math.PI/2) * ShipToExhastLength,
				this.ship.vel.x,
				this.ship.vel.y,
				ShipExhaustRate,
				ShipExhaustVelocity,
				this.ship.angle + Math.PI/2,
				ShipExhaustSpread,
				paceFactor
			);

			// Cancel PopUp
			if(this.popUpThrustActive){
				this.popUpLife = Math.min(PopUpCancelTime, this.popUpLife);
			}
		} else {
			if (this.engine_is_thrusting){
				this.engine_sound.stop();
				this.engine_is_thrusting = false;
			}
		}
	},

	update: function(paceFactor) {
		var i, len, b, numOusideEnemies, outsideEnemyAngles;

		this.gameClock += paceFactor;

		if(!this.gameOver){
			this.spawn_manager.update(paceFactor);
		}

		if (this.ship.visible){
			if (this.ship.dead){
				this.engine_sound.stop();
				this.lives--;
				if(this.lives <= 0){
					this.gameOver = true;
				}
				this.ship.visible = false;
				this.ship.dead = false;
			}
			else{
				// Update ship
				this.ship.vel.y += Gravity * paceFactor;
				this.ship.vel.x *= Math.pow((1-AtmosphericFriction), paceFactor);
				this.ship.vel.y *= Math.pow((1-AtmosphericFriction), paceFactor);
				this.ship.world_x += this.ship.vel.x * paceFactor;
				this.ship.world_y += this.ship.vel.y * paceFactor;
				var ground_y = this.altitude[Math.floor(this.ship.world_x)];
				if (this.ship.world_y > ground_y - ShipToBottomLength){
					this.ship.world_y = ground_y - ShipToBottomLength;
					var landed=false;
					// Crash or land
					for(i=0, len=this.pads.length; i<len; i++){
						var distance_to_center = Math.abs(this.ship.world_x - this.pads[i].world_x);
						var landing_vel = this.ship.vel.y;
						var lateral_vel_abs = Math.abs(this.ship.vel.x);
						var landing_angle = flynnUtilAngleBound2Pi(this.ship.angle);
						if (landing_vel > 0.3 && this.mcp.developerModeEnabled){
							console.log("Landing velocity:", landing_vel);
							console.log("Landing angle:", landing_angle);
						}
						if ((distance_to_center <= ShipLandingMargin) &&
							(landing_vel < ShipLandingVelocityMax) &&
							(lateral_vel_abs < ShipLandingLateralVelocitymax) &&
							( (landing_angle < ShipLandingAngleMax) || (landing_angle>Math.PI*2-ShipLandingAngleMax))
							)
							{
							this.ship.angle = ShipStartAngle;
							this.ship.setAngle(this.ship.angle);
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
				} else if (this.ship.world_y < 30){
					this.ship.world_y = 30;
					this.ship.vel.y = 0;
				}
				if (this.ship.world_x > WorldWidth - 40){
					this.ship.world_x = WorldWidth - 40;
					this.ship.vel.x = 0;
				} else if (this.ship.world_x < 40){
					this.ship.world_x = 40;
					this.ship.vel.x = 0;
				}

				if (this.ship.world_y < ground_y - ShipToBottomLength - 5){
					this.ship.is_landed = false;
				}

				// Unload passenger
				if(this.ship.is_landed && this.ship.human_on_board && this.ship.world_x > ShipStartX - 100){  //TODO: Lazy math
					this.ship.human_on_board = false;
					this.humans.push(new Human(
						FlynnColors.WHITE,
						this.ship.world_x + 20,
						WorldHeight - MountainBaseAreaHeight,
						this
						));
				}
			}
		}
		else{
			// Respawn after min delay is met
			if(!this.gameOver && this.mcp.timers.isExpired('shipRespawnDelay')){
				if(!this.mcp.timers.isActive('shipRespawnAnimation')){
					// Start the respawn animation timer (which also triggers the animation)
					this.mcp.timers.set('shipRespawnAnimation', ShipRespawnAnimationTicks);
					this.ship_respawn_sound.play();
				}
				else{
					// Respawn animation timer is active

					// If respawn animation has finished...
					if(this.mcp.timers.isExpired('shipRespawnAnimation')){
						// Deactivate the timer
						this.mcp.timers.set('shipRespawnAnimation', 0);
						// Respawn the ship
						this.ship.world_x = ShipStartX;
						this.ship.world_y = ShipStartY;
						this.ship.angle = ShipStartAngle;
						this.ship.vel.x = 0;
						this.ship.vel.y = 0;
						this.ship.visible = true;
						this.ship.dead = false;
					}
				}
			}
		}

		//-------------------
		// Kamikazes
		//-------------------
		// Kamikaze: Spawn
		if (Math.random() < KamikazeSpawnProbability && this.spawn_manager.spawn_pool.kamikazes > 0) {
			--this.spawn_manager.spawn_pool.kamikazes;
			this.kamikazes.push(new Kamikaze(
				Points.MONSTER,
				KamikazeScale,
				new Victor(
					Math.random() * (WorldWidth - 200) + 100,
					Math.random() * 50),
				KamikazeColor
				));
		}


		var killed, j, len2;

		// Kamikaze: Collisions
		for(i=0, len=this.kamikazes.length; i<len; i+=1){
			killed = false;
			// Homing
			if(this.ship.visible){
				this.kamikazes[i].flyToward(new Victor(this.ship.world_x, this.ship.world_y));
			}
			// Update
			this.kamikazes[i].update(paceFactor);

			// Check for ship/kamikaze collision
			if(this.ship.visible){
				if(this.kamikazes[i].collide(this.ship)){
					this.doShipDie();
					killed = true;
				}
			}
			// Check for exhaust/saucer collision
			var kamikaze_x = this.kamikazes[i].world_position_v.x;
			var kamikaze_y = this.kamikazes[i].world_position_v.y;
			for(j=0, len2=this.particles.particles.length; j<len2; j++){
				ptc = this.particles.particles[j];
				if(ptc.type === ParticleTypes.EXHAUST){
					if(flynnProximal(100, ptc.x, kamikaze_x) && flynnProximal(100, ptc.y, kamikaze_y)){
						if(this.kamikazes[i].hasPoint(ptc.x, ptc.y)){
							killed = true;
						}
					}
				}
			}

			if(killed){
				// Remove Kamikaze
				this.particles.explosion(
					this.kamikazes[i].world_position_v.x,
					this.kamikazes[i].world_position_v.y,
					this.kamikazes[i].velocity_v.x,
					this.kamikazes[i].velocity_v.y,
					ShipNumExplosionParticles,
					ShipExplosionMaxVelocity * 0.6,
					KamikazeColor,
					ParticleTypes.PLAIN);
				this.kamikazes.splice(i,1);
				i--;
				len--;
				this.addPoints(PointsKamikaze);
				this.saucer_die_sound.play();
			}
		}

		//-------------------
		// Saucers
		//-------------------

		// Saucer: Spawn
		if (Math.random() < SaucerSpawnProbabiliy && this.spawn_manager.spawn_pool.saucers > 0) {
			--this.spawn_manager.spawn_pool.saucers;
			this.saucers.push(new Saucer(
				Points.SAUCER,
				SaucerScale,
				Math.random() * (WorldWidth - 200) + 100,
				Math.random() * 30,
				SaucerColor
				));
		}

		// Saucer: shoot
		if(this.ship.visible){
			for (i=0, len=this.saucers.length; i<len; i++){
				// Cannon cooldown
				if(this.ship.world_y > this.saucers[i].world_y){
					// Ship below saucer.  Cool the cannon down.
					this.saucers[i].cannonCooldown();
				}

				// Shoot
				if(this.saucers[i].cannonIsWarm() && Math.random() < SaucerShootProbability){
					var ship_pos_v = new Victor(this.ship.world_x, this.ship.world_y);
					var saucer_pos_v = new Victor(this.saucers[i].world_x, this.saucers[i].world_y);
					distance = ship_pos_v.clone().subtract(saucer_pos_v).magnitude();

					// If ship within firing range
					if (distance < SaucerShootRange){
						var solution = flynnInterceptSolution(
							new Victor(this.ship.world_x, this.ship.world_y),
							new Victor(this.ship.vel.x, this.ship.vel.y),
							new Victor(this.saucers[i].world_x, this.saucers[i].world_y + SaucerCannonOffset),
							SaucerShootVelocity
							);

						// If firing solution results in an upward projectile velocity
						if (solution.velocity_v.y < 0){
							this.projectiles.add(
								new Victor(
									this.saucers[i].world_x,
									this.saucers[i].world_y + SaucerCannonOffset),
								solution.velocity_v,
								SaucerShootLife,
								SaucerShootSize,
								FlynnColors.YELLOW
								);
							this.sound_saucer_shoot.play();
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
				if(this.saucers[i].collide(this.ship)){
					this.doShipDie();
					killed = true;
				}
			}
			// Check for exhaust/saucer collision
			var saucer_x = this.saucers[i].world_x;
			var saucer_y = this.saucers[i].world_y;
			for(j=0, len2=this.particles.particles.length; j<len2; j++){
				ptc = this.particles.particles[j];
				if(ptc.type === ParticleTypes.EXHAUST){
					if(flynnProximal(100, ptc.x, saucer_x) && flynnProximal(100, ptc.y, saucer_y)){
						if(this.saucers[i].hasPoint(ptc.x, ptc.y)){
							killed = true;
						}
					}
				}
			}

			if(killed){
				// Remove Saucer
				this.particles.explosion(
					this.saucers[i].world_x,
					this.saucers[i].world_y,
					this.saucers[i].dx,
					this.saucers[i].dy,
					ShipNumExplosionParticles,
					ShipExplosionMaxVelocity * 0.6,
					SaucerColor,
					ParticleTypes.PLAIN);
				this.saucers.splice(i,1);
				i--;
				len--;
				this.addPoints(PointsSaucer);
				this.saucer_die_sound.play();
			}
		}

		//-------------------
		// Projectiles
		//-------------------
		this.projectiles.update(paceFactor);
		// Collision detect
		for(i=0, len=this.projectiles.projectiles.length; i<len; i++){
			if(this.ship.visible && this.ship.hasPoint(
										this.projectiles.projectiles[i].world_position_v.x,
										this.projectiles.projectiles[i].world_position_v.y)){
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
			if (this.gameClock >= PopUpThrustPromptTime)
			{
				this.popUpThrustPending = false;
				this.popUpThrustActive = true;
				this.showPopUp(this.mcp.custom.thrustPrompt);
				this.popUpLife = PopUpTextLife;
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

			this.laserPods[i].update(paceFactor);
			killed = false;

			// Check for Ship/(LaserPod or beam) collision
			if(this.ship.visible){
				if(this.laserPods[i].collide(this.ship, new Victor(this.ship.world_x, this.ship.world_y))){
					this.doShipDie();
					this.sound_laser_pod.play();
					//killed = true;
				}
			}

			// Check for exhaust/LaserPod collision
			var laserPod_world_pos_v = this.laserPods[i].world_position_v;
			for(j=0, len2=this.particles.particles.length; j<len2; j++){
				ptc = this.particles.particles[j];
				if(ptc.type === ParticleTypes.EXHAUST){
					if(flynnProximal(50, ptc.x, laserPod_world_pos_v.x) && flynnProximal(50, ptc.y, laserPod_world_pos_v.y)){
						if(this.laserPods[i].hasPoint(ptc.x, ptc.y)){
							killed = true;
						}
					}
				}
			}

			if (killed){
				// Remove LaserPod
				this.particles.explosion(
					this.laserPods[i].world_position_v.x,
					this.laserPods[i].world_position_v.y,
					0,
					0,
					LaserPodNumExplosionParticles,
					LaserPodExplosionMaxVelocity * 0.6,
					LaserPodColor,
					ParticleTypes.PLAIN);
				this.laserPods.splice(i,1);
				i--;
				len--;
				this.addPoints(PointsLaserPod);
				this.saucer_die_sound.play();
			}
		}

		// Viewport
		var goal_x = this.ship.world_x;
		var goal_y = this.ship.world_y;
		if (!this.ship.visible && this.mcp.timers.isExpired('shipRespawnDelay') && !this.gameOver){
			// Pan to ship start location after ship death
			goal_x = ShipStartX;
			goal_y = ShipStartY;
		}

		var target_viewport_x = goal_x - this.canvasWidth/2;
		if(target_viewport_x < 0){
			target_viewport_x= 0;
		} else if  (target_viewport_x > WorldWidth - this.canvasWidth){
			target_viewport_x = WorldWidth - this.canvasWidth;
		}
		var slew = flynnMinMaxBound(target_viewport_x - this.viewport_v.x, -ViewportSlewMax, ViewportSlewMax);
		this.viewport_v.x += slew;

		var target_viewport_y = goal_y - (this.canvasHeight-InfoPanelHeight)/2 - InfoPanelHeight;
		if (target_viewport_y < 0 - InfoPanelHeight){
			target_viewport_y = 0 - InfoPanelHeight;
		}
		else if (target_viewport_y> WorldHeight - this.canvasHeight){
			target_viewport_y = WorldHeight - this.canvasHeight;
		}
		slew = flynnMinMaxBound(target_viewport_y - this.viewport_v.y, -ViewportSlewMax, ViewportSlewMax);
		this.viewport_v.y += slew;

	},

	render: function(ctx){
		ctx.clearAll();

		// PopUp Text
		// if(this.popUpLife > 0){
		// 	   ctx.vectorText();
		// 	   if(this.popUpText2){
		//	       ctx.vectorText()
		//     }
		// }

		// Ship respawn animation
		if(this.mcp.timers.isActive('shipRespawnAnimation')){
			var animationPercentage = this.mcp.timers.get('shipRespawnAnimation') / ShipRespawnAnimationTicks;
			var sizePercentageStep = 0.005;
			var rotationPercentageStep = 0.1;
			var startRadius = 200 * animationPercentage;
			var numParticles = 100 * (1-animationPercentage);
			var startAngle = Math.PI * 1 * animationPercentage;
			var angleStep = Math.PI * 8 / 100;
			var radiusStep = 2 * animationPercentage;
			ctx.fillStyle=FlynnColors.YELLOW;
			for(i=0; i<numParticles; i++){
				var angle = startAngle + i * angleStep;
				var radius = startRadius + radiusStep * i;
				var x = ShipStartX + Math.cos(angle) * radius - this.viewport_v.x;
				var y = ShipStartY + Math.sin(angle) * radius - this.viewport_v.y;
				ctx.fillRect(x,y,2,2);
			}
		}

		// Stars
		ctx.fillStyle="#808080";
		for(i=0, len=this.stars.length; i<len; i+=2){
			ctx.fillRect(
				this.stars[i] - this.viewport_v.x,
				this.stars[i+1] - this.viewport_v.y,
				2,2);
		}

		// Mountains
		ctx.vectorStart(FlynnColors.BROWN);
		ctx.vectorMoveTo(
			this.mountains[0] - this.viewport_v.x,
			this.mountains[1] - this.viewport_v.y);
		for(i=2, len=this.mountains.length; i<len; i+=2){
			ctx.vectorLineTo(
				this.mountains[i] - this.viewport_v.x,
				this.mountains[i+1] - this.viewport_v.y);
		}
		ctx.vectorEnd();

		// Player
		this.ship.draw(ctx, this.viewport_v.x, this.viewport_v.y);

		// Particles
		this.particles.draw(ctx, this.viewport_v.x, this.viewport_v.y);

		// Pads
		for(i=0, len=this.pads.length; i<len; i+=1){
			this.pads[i].draw(ctx, this.viewport_v.x, this.viewport_v.y);
		}

		// Structures
		for(i=0, len=this.structures.length; i<len; i+=1){
			this.structures[i].draw(ctx, this.viewport_v.x, this.viewport_v.y);
		}

		// Humans
		for(i=0, len=this.humans.length; i<len; i+=1){
			this.humans[i].draw(ctx, this.viewport_v.x, this.viewport_v.y);
		}

		// Saucers
		for(i=0, len=this.saucers.length; i<len; i+=1){
			this.saucers[i].draw(ctx, this.viewport_v.x, this.viewport_v.y);
		}

		// Kamikazes
		for (i=0, len=this.kamikazes.length; i<len; i++){
			this.kamikazes[i].draw(ctx, this.viewport_v);
		}

		// Laser Pods
		for(i=0, len=this.laserPods.length; i<len; i+=1){
			this.laserPods[i].draw(ctx, this.viewport_v.x, this.viewport_v.y);
		}

		// Projectiles
		this.projectiles.draw(ctx, this.viewport_v);

		//------------
		// Info Panel
		//------------

		// Clear panel area
		ctx.fillStyle=FlynnColors.BLACK;
		ctx.fillRect(0, 0, this.canvasWidth, InfoPanelHeight);
		ctx.vectorStart(FlynnColors.WHITE);
		ctx.vectorMoveTo(0, InfoPanelHeight + 0.5);
		ctx.vectorLineTo(this.canvasWidth-1, InfoPanelHeight + 0.5);
		ctx.vectorEnd();

		// Scores
		ctx.vectorText(this.score, 3, 15, 15, null, FlynnColors.GREEN);
		ctx.vectorText(this.highscore, 3, this.canvasWidth - 6	, 15, 0 , FlynnColors.GREEN);

		// Extra Lives
		for(var i=0; i<this.lives; i++){
			ctx.drawPolygon(this.lifepolygon, 20+20*i, 55);
		}

		if(this.ship.human_on_board){
			ctx.vectorText("PASSENGER", 1, 15, 70, null, FlynnColors.WHITE);
		}

		//------------
		// Radar
		//------------

		// Console
		ctx.fillStyle=FlynnColors.BLACK;
		ctx.fillRect(RadarMargin,3,this.radarWidth,this.radarHeight);
		ctx.vectorRect(RadarMargin-1,RadarTopMargin-1,this.radarWidth+2,this.radarHeight+2, FlynnColors.WHITE);

		// Mountains
		ctx.vectorStart(FlynnColors.BROWN);
		ctx.vectorMoveTo(
			this.radarMountains[0],
			this.radarMountains[1]);
		for(i=2, len=this.radarMountains.length; i<len; i+=2){
			ctx.vectorLineTo(
				this.radarMountains[i],
				this.radarMountains[i+1]);
		}
		ctx.vectorEnd();

		// Ship
		var radar_location;
		if(this.ship.visible){
			radar_location = this.worldToRadar(this.ship.world_x, this.ship.world_y);
			ctx.fillStyle=FlynnColors.YELLOW;
			ctx.fillRect(radar_location[0], radar_location[1],2,2);
		}

		// Humans
		ctx.fillStyle=FlynnColors.WHITE;
		for(i=0, len=this.humans.length; i<len; i+=1){
			radar_location = this.worldToRadar(this.humans[i].world_x, this.humans[i].world_y);
			ctx.fillRect(radar_location[0], radar_location[1]-1,2,2);
		}

		// Saucers
		ctx.fillStyle=SaucerColor;
		for(i=0, len=this.saucers.length; i<len; i+=1){
			radar_location = this.worldToRadar(this.saucers[i].world_x, this.saucers[i].world_y);
			ctx.fillRect(radar_location[0], radar_location[1],2,2);
		}

		// Kamikazes
		ctx.fillStyle=KamikazeColor;
		for(i=0, len=this.kamikazes.length; i<len; i+=1){
			radar_location = this.worldToRadar(this.kamikazes[i].world_position_v.x, this.kamikazes[i].world_position_v.y);
			ctx.fillRect(radar_location[0], radar_location[1],2,2);
		}

		// LaserPods
		ctx.fillStyle=LaserPodColor;
		ctx.vectorStart(LaserPodBeamColor);
		for(i=0, len=this.laserPods.length; i<len; i+=1){
			radar_location = this.worldToRadar(this.laserPods[i].world_position_v.x, this.laserPods[i].world_position_v.y);
			ctx.fillRect(radar_location[0], radar_location[1]-2,2,2);
			radar_location[0] = Math.floor(radar_location[0]) + 1.5;
			ctx.vectorMoveTo(radar_location[0], radar_location[1]-3);
			ctx.vectorLineTo(radar_location[0], RadarTopMargin+2);
		}
		ctx.vectorEnd();

		// Pads
		ctx.fillStyle=FlynnColors.CYAN;
		for(i=0, len=this.pads.length; i<len; i+=1){
			radar_location = this.worldToRadar(this.pads[i].world_x, this.pads[i].world_y);
			ctx.fillRect(radar_location[0]-1, radar_location[1],4,2);
		}

		// Viewport
		radar_location = this.worldToRadar(this.viewport_v.x, this.viewport_v.y + InfoPanelHeight);
		var radar_scale = this.radarWidth / WorldWidth;
		ctx.vectorRect(
			radar_location[0],radar_location[1],
			this.canvasWidth*radar_scale, (this.canvasHeight - InfoPanelHeight)*radar_scale,
			"#606060");

		//------------
		// Text
		//------------

		// Game Over
		if(this.gameOver){
			ctx.vectorText("GAME OVER", 6, null, 200, null, FlynnColors.ORANGE);
			ctx.vectorText("PRESS <ENTER>", 2, null, 250, null, FlynnColors.ORANGE);
		}
	}
});