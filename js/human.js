
var HumanScale = 0.6;
var ArmLength = 9 * HumanScale;
var ForeArmLength = 9 * HumanScale;
var ThighLength = 10 * HumanScale;
var ShinLength = 9 * HumanScale;
var TorsoLength = 12  * HumanScale;
var HeadRadius = 3 * HumanScale;
var ShoulderHeight = TorsoLength * 0.80;

var HumanLimbSpeed = 6;
var HumanJumpSpeed = 1;
var HumanRunSpeed = 1;

// Angle indecies
var idx_torso_ang = 0;
var idx_hip1_ang = 1;
var idx_hip2_ang = 2;
var idx_knee1_ang = 3;
var idx_knee2_ang = 4;
var idx_shoulder1_ang = 5;
var idx_shoulder2_ang = 6;
var idx_arm1_ang = 7;
var idx_arm2_ang = 8;
var idx_jump     = 9;

var TimerWave = 15;
var TimerRun = 4;

var WaveDistance = 200;

var NumRunFrames = 12;
var FirstRunFrame = 2;

var HumanActions = {
    STAND:     0,
    COWER:     1,
    RUN_RIGHT: 2,
    WALK:      3,
    WAVE:      4,
    SCREAM:    5,
    RUN_LEFT:  6,
};

var RunningAnimationRight = [
//   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2    Jump
	[75,    -130,  -50,   -160,   -50,   -85,  -185,  5,    -140,  0],  // 0 Contact
	[80,    -90,   -30,   -190,   -100,  -85,  -160,  5,    -105,  0],  // 1 The DOWN
	[80,    -80,   -82,   -170,   -100,  -95,  -105,  -50,  -95,   0],  // 2
	[75,    -20,   -95,   -105,   -115,  -130, -100,  -60,  -40,   0],  // 3 Pass position
	[80,    -15,   -135,  -85,    -135,  -135, -95,   -85,  -20,   0],  // 4 The UP
	[80,    -15,   -130,  -85,    -180,  -145, -90,   -95,  0,     5],  // 5 Airborne
];
var RunningAnimationLeft = [];

var StanceStand =
//   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2    Jump
	[80,    -55,   -125,  -100,  -80,   -30,  -150,   80,   -120,  0];
var StanceWave =
//   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2    Jump
	[80,    -55,   -125,  -100,  -80,   -30,  -150,   80,   -120,  0];

// TODO: This does not need to be a polygon class extension
var Human = FlynnPolygon.extend({

	init: function(color, world_x, world_y, game_state){

		this.world_x = world_x;
		this.world_y = world_y;
		this.home_world_x = world_x;
		this.color = color;
		this.game_state = game_state;

		this.angles_deg_goal = StanceStand;

		this.action = HumanActions.STAND;
		this.run_frame = FirstRunFrame;
		this.valid = true;

		this.frame_counter = 0;
		this.wave_left = true;

		this.angles_rad = [];
		this.angles_deg = [];
		for (var i=0, len=this.angles_deg_goal.length; i<len; i++){
			this.angles_rad.push(0);
			this.angles_deg[i] = this.angles_deg_goal[i];
		}

		//-----------------------------
		// Populate Running Animations
		//-----------------------------
		len = RunningAnimationRight.length;
		for (i=0; i<len; i++){
			// Other side of body for running animation is same as first set, just swap left/right arms
			RunningAnimationRight.push(
				[	RunningAnimationRight[i][idx_torso_ang],
					RunningAnimationRight[i][idx_hip2_ang],
					RunningAnimationRight[i][idx_hip1_ang],
					RunningAnimationRight[i][idx_knee2_ang],
					RunningAnimationRight[i][idx_knee1_ang],
					RunningAnimationRight[i][idx_shoulder2_ang],
					RunningAnimationRight[i][idx_shoulder1_ang],
					RunningAnimationRight[i][idx_arm2_ang],
					RunningAnimationRight[i][idx_arm1_ang],
					RunningAnimationRight[i][idx_jump],
				]
			);
		}


		RunningAnimationLeft = [];
		len = RunningAnimationRight.length;
		for (i=0; i<len; i++){
			// Other direction (running left) is mirror of running right
			RunningAnimationLeft.push(
				[	this.mirror_run_angle(RunningAnimationRight[i][idx_torso_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_hip1_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_hip2_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_knee1_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_knee2_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_shoulder1_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_shoulder2_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_arm1_ang]),
					this.mirror_run_angle(RunningAnimationRight[i][idx_arm2_ang]),
					RunningAnimationRight[i][idx_jump],
				]
			);
		}



	},

	mirror_run_angle: function(degrees){
		if(degrees>45){
			return(90+(90-degrees)); // Torso generally (upward angles, centered around 90)
		}
		return(-270 -(degrees-90));  // limbs (downward angles, centered around -90)
	},

	deg_to_rad: function(degrees){
		return((-degrees/180)*Math.PI);
	},

	translate_angles: function(){
		for (var i=0, len=this.angles_deg.length; i<len; i++){
			this.angles_rad[i] = this.deg_to_rad(this.angles_deg[i]);
		}
	},

	update: function(paceFactor){
		// Action state machine
		if (this.action === HumanActions.STAND){
			if( Math.abs(this.world_x - this.game_state.ship.world_x) < WaveDistance){
				// START: WAVE
				this.action = HumanActions.WAVE;
				this.angles_deg_goal = StanceStand;
				this.angles_deg_goal[idx_torso_ang] = 100;
				this.frame_counter = TimerWave;
				this.wave_left = true;
			}
		}

		// Determine goal position
		var goal_x = this.home_world_x;
		var safehouse_x = this.game_state.structures[0].world_x;
		var safehouse_distance = Math.abs(safehouse_x - this.world_x);
		if(safehouse_distance < 400){
			goal_x = safehouse_x;

			if (safehouse_distance < 4 * HumanRunSpeed){
				this.game_state.humans_rescued++;
				this.game_state.addPoints(PointsRescuedHuman);
				this.valid = false;
			}
		}
		else if (this.game_state.ship.is_landed && !this.game_state.ship.human_on_board){
			var ship_distance = Math.abs(this.game_state.ship.world_x - this.world_x);
			if (ship_distance < 400){  //TODO: remove magic number
				goal_x = this.game_state.ship.world_x;

				if (ship_distance < 4 * HumanRunSpeed){
					this.game_state.ship.human_on_board = true;
					this.game_state.addPoints(PointsPickUpHuman);
					this.valid = false;
				}
			}
		}

		var goal_distance = goal_x - this.world_x;
		if (Math.abs(goal_distance) > HumanRunSpeed * 2){
			// Run toward Goal
			if(goal_distance<0){
				this.action = HumanActions.RUN_LEFT;
			}
			else{
				this.action = HumanActions.RUN_RIGHT;
			}
		} else{
			if ((this.action === HumanActions.RUN_RIGHT) || (this.action === HumanActions.RUN_LEFT)){
				// Goal reached.  Stop Running.
				this.action = HumanActions.STAND;
				this.angles_deg_goal = StanceStand;
			}
		}


		if (this.action === HumanActions.WAVE) {

			if( Math.abs(this.world_x - this.game_state.ship.world_x) >= WaveDistance){
				// START: STAND
				this.action = HumanActions.STAND;
				this.angles_deg_goal[idx_shoulder1_ang] = -30;
				this.angles_deg_goal[idx_arm1_ang] = -80;
				this.angles_deg_goal[idx_torso_ang] = 80;
			}
			else{
				this.frame_counter--;
				if(this.frame_counter < 0){
					this.angles_deg_goal[idx_shoulder1_ang] = 40;
					if (this.wave_left){
						this.wave_left = false;
						this.angles_deg_goal[idx_arm1_ang] = 60;
					}
					else{
						this.wave_left = true;
						this.angles_deg_goal[idx_arm1_ang] = 120;
					}
					this.frame_counter = TimerWave;
				}
			}
		}
		else if (this.action === HumanActions.RUN_RIGHT) {
			this.frame_counter--;
			if(this.frame_counter < 0){
				this.run_frame++;
				if(this.run_frame>=NumRunFrames){
					this.run_frame=0;
				}
				this.angles_deg_goal = RunningAnimationRight[this.run_frame];
				this.frame_counter = TimerRun;
			}
			this.world_x += HumanRunSpeed;
		}
		else if (this.action === HumanActions.RUN_LEFT) {
			this.frame_counter--;
			if(this.frame_counter < 0){
				this.run_frame++;
				if(this.run_frame>=NumRunFrames){
					this.run_frame=0;
				}
				this.angles_deg_goal = RunningAnimationLeft[this.run_frame];
				this.frame_counter = TimerRun;
			}
			this.world_x -= HumanRunSpeed;
		}

		// Move toward goal angles
		for (var i=0, len=this.angles_deg_goal.length; i<len; i++){
			var delta = this.angles_deg_goal[i] - this.angles_deg[i];
			if(delta !==0){
				if(i!==idx_jump){
					update = flynnMinMaxBound( delta, -HumanLimbSpeed, HumanLimbSpeed);
				}
				else{
					update = flynnMinMaxBound( delta, -HumanJumpSpeed, HumanJumpSpeed);
				}

				this.angles_deg[i] += update;
				// if (Math.abs(delta) < 1){
				// 	this.angles_deg[i] = this.angles_deg_goal[i];
				// }
				// else if (delta > 0){
				// 	this.angles_deg[i]+=HumanLimbSpeed;
				// }
				// else{
				// 	this.angles_deg[i]-=HumanLimbSpeed;
				// }
			}
		}
	},

	draw: function(ctx, viewport_x, viewport_y){

		this.translate_angles();

		var pelvis_1_height =
			ThighLength * Math.sin(this.angles_rad[idx_hip1_ang]) +
			ShinLength * Math.sin(this.angles_rad[idx_knee1_ang]);
		var pelvis_2_height =
			ThighLength * Math.sin(this.angles_rad[idx_hip2_ang]) +
			ShinLength * Math.sin(this.angles_rad[idx_knee2_ang]);
		var pelvis_height = Math.max(pelvis_1_height, pelvis_2_height) + this.angles_deg[idx_jump];
		var pelvis_pt = [
			this.world_x - viewport_x,
			this.world_y - pelvis_height - viewport_y
		];
		var knee1_pt = [
			pelvis_pt[0] + ThighLength * Math.cos(this.angles_rad[idx_hip1_ang]),
			pelvis_pt[1] + ThighLength * Math.sin(this.angles_rad[idx_hip1_ang]),
		];
		var foot1_pt = [
			knee1_pt[0] + ShinLength * Math.cos(this.angles_rad[idx_knee1_ang]),
			knee1_pt[1] + ShinLength * Math.sin(this.angles_rad[idx_knee1_ang]),
		];
		var knee2_pt = [
			pelvis_pt[0] + ThighLength * Math.cos(this.angles_rad[idx_hip2_ang]),
			pelvis_pt[1] + ThighLength* Math.sin(this.angles_rad[idx_hip2_ang]),
		];
		var foot2_pt = [
			knee2_pt[0] + ShinLength * Math.cos(this.angles_rad[idx_knee2_ang]),
			knee2_pt[1] + ShinLength * Math.sin(this.angles_rad[idx_knee2_ang]),
		];
		var neck_pt = [
			pelvis_pt[0] + TorsoLength * Math.cos(this.angles_rad[idx_torso_ang]),
			pelvis_pt[1] + TorsoLength * Math.sin(this.angles_rad[idx_torso_ang]),
		];
		var shoulder_pt = [
			pelvis_pt[0] + ShoulderHeight * Math.cos(this.angles_rad[idx_torso_ang]),
			pelvis_pt[1] + ShoulderHeight * Math.sin(this.angles_rad[idx_torso_ang]),
		];
		var elbow1_pt = [
			shoulder_pt[0] + ArmLength * Math.cos(this.angles_rad[idx_shoulder1_ang]),
			shoulder_pt[1] + ArmLength * Math.sin(this.angles_rad[idx_shoulder1_ang]),
		];
		var hand1_pt = [
			elbow1_pt[0] + ForeArmLength * Math.cos(this.angles_rad[idx_arm1_ang]),
			elbow1_pt[1] + ForeArmLength * Math.sin(this.angles_rad[idx_arm1_ang]),
		];
		var elbow2_pt = [
			shoulder_pt[0] + ArmLength * Math.cos(this.angles_rad[idx_shoulder2_ang]),
			shoulder_pt[1] + ArmLength * Math.sin(this.angles_rad[idx_shoulder2_ang]),
		];
		var hand2_pt = [
			elbow2_pt[0] + ForeArmLength * Math.cos(this.angles_rad[idx_arm2_ang]),
			elbow2_pt[1] + ForeArmLength * Math.sin(this.angles_rad[idx_arm2_ang]),
		];
		var head_pt = [
			pelvis_pt[0] + (TorsoLength + HeadRadius) * Math.cos(this.angles_rad[idx_torso_ang]),
			pelvis_pt[1] + (TorsoLength + HeadRadius) * Math.sin(this.angles_rad[idx_torso_ang]),
		];

		ctx.strokeStyle = this.color;
		ctx.beginPath();

		// Leg 1
		ctx.moveTo(pelvis_pt[0], pelvis_pt[1]);
		ctx.lineTo(knee1_pt[0], knee1_pt[1]);
		ctx.lineTo(foot1_pt[0], foot1_pt[1]);
		// Leg 2
		ctx.moveTo(pelvis_pt[0], pelvis_pt[1]);
		ctx.lineTo(knee2_pt[0], knee2_pt[1]);
		ctx.lineTo(foot2_pt[0], foot2_pt[1]);
		// Torso
		ctx.moveTo(pelvis_pt[0], pelvis_pt[1]);
		ctx.lineTo(neck_pt[0], neck_pt[1]);
		// Arm 1
		ctx.moveTo(shoulder_pt[0], shoulder_pt[1]);
		ctx.lineTo(elbow1_pt[0], elbow1_pt[1]);
		ctx.lineTo(hand1_pt[0], hand1_pt[1]);
		// Arm 2
		ctx.moveTo(shoulder_pt[0], shoulder_pt[1]);
		ctx.lineTo(elbow2_pt[0], elbow2_pt[1]);
		ctx.lineTo(hand2_pt[0], hand2_pt[1]);
		// Head
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(head_pt[0], head_pt[1], HeadRadius, 0, 2 * Math.PI, false);

		ctx.stroke();

		//ctx.drawPolygon(this, this.world_x - viewport_x, this.world_y - viewport_y);
	}
});