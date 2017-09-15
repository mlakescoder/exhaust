var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.humanConfig = {
    // This is not a class.  This is a single instance
    // object which contains configuration information
    // (constants) relevant to the Human class.
    
    limbSpeed: 6,
    jumpSpeed: 1,
    runSpeed: 1,

    idx: {
        // Angle indices
        torso_ang: 0,
        hip1_ang: 1,
        hip2_ang: 2,
        knee1_ang: 3,
        knee2_ang: 4,
        shoulder1_ang: 5,
        shoulder2_ang: 6,
        arm1_ang: 7,
        arm2_ang: 8,
        jump: 9,
    },

    timerWave: 15,
    timerRun: 4,

    waveDistance: 200,

    numRunFrames: 12,
    firstRunFrame: 2,

    actions:{
        STAND:     0,
        COWER:     1,
        RUN_RIGHT: 2,
        WALK:      3,
        WAVE:      4,
        SCREAM:    5,
        RUN_LEFT:  6,
    },

    runningAnimationRight: [
    //   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2   Jump
        [75,    -130,  -50,   -160,   -50,   -85,  -185,  5,    -140,  0],  // 0 Contact
        [80,    -90,   -30,   -190,   -100,  -85,  -160,  5,    -105,  0],  // 1 The DOWN
        [80,    -80,   -82,   -170,   -100,  -95,  -105,  -50,  -95,   0],  // 2
        [75,    -20,   -95,   -105,   -115,  -130, -100,  -60,  -40,   0],  // 3 Pass position
        [80,    -15,   -135,  -85,    -135,  -135, -95,   -85,  -20,   0],  // 4 The UP
        [80,    -15,   -130,  -85,    -180,  -145, -90,   -95,  0,     5],  // 5 Airborne
    ],
    runningAnimationLeft: [],

    stanceStand:
    //   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2   Jump
        [80,    -55,   -125,  -100,  -80,   -30,  -150,   80,   -120,  0],
    stanceWave:
    //   Torso  Hip1   Hip2   Knee1  Knee2  Shld1  Shld2  Arm1  Arm2   Jump
        [80,    -55,   -125,  -100,  -80,   -30,  -150,   80,   -120,  0],

    init: function(){
        this.scale = 0.6;
        this.armLength = 9 * this.scale;
        this.foreArmLength = 9 * this.scale;
        this.thighLength = 10 * this.scale;
        this.shinLength = 9 * this.scale;
        this.torsoLength = 12  * this.scale;
        this.headRadius = 3 * this.scale;
        this.shoulderHeight = this.torsoLength * 0.80;

        var len = this.runningAnimationRight.length;
        var i;

        for (i=0; i<len; i++){
            // Other side of body for running animation is same as first set, just swap left/right arms
            this.runningAnimationRight.push(
                [   this.runningAnimationRight[i][this.idx.torso_ang],
                    this.runningAnimationRight[i][this.idx.hip2_ang],
                    this.runningAnimationRight[i][this.idx.hip1_ang],
                    this.runningAnimationRight[i][this.idx.knee2_ang],
                    this.runningAnimationRight[i][this.idx.knee1_ang],
                    this.runningAnimationRight[i][this.idx.shoulder2_ang],
                    this.runningAnimationRight[i][this.idx.shoulder1_ang],
                    this.runningAnimationRight[i][this.idx.arm2_ang],
                    this.runningAnimationRight[i][this.idx.arm1_ang],
                    this.runningAnimationRight[i][this.idx.jump],
                ]
            );
        }

        len = this.runningAnimationRight.length;
        for (i=0; i<len; i++){
            // Other direction (running left) is mirror of running right
            this.runningAnimationLeft.push(
                [   this.mirror_run_angle(this.runningAnimationRight[i][this.idx.torso_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.hip1_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.hip2_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.knee1_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.knee2_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.shoulder1_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.shoulder2_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.arm1_ang]),
                    this.mirror_run_angle(this.runningAnimationRight[i][this.idx.arm2_ang]),
                    this.runningAnimationRight[i][this.idx.jump],
                ]
            );
        }
        return this;
    },

    mirror_run_angle: function(degrees){
        if(degrees>45){
            return(90+(90-degrees)); // Torso generally (upward angles, centered around 90)
        }
        return(-270 -(degrees-90));  // limbs (downward angles, centered around -90)
    },
}.init();

Game.Human = Class.extend({

    init: function(color, position, game_state){

        this.position = {x:position.x, y:position.y};
        this.home_x = position.x;
        this.color = color;
        this.colorAsNumber = Flynn.Util.parseColor(color, true);
        this.game_state = game_state;

        this.angles_deg_goal = Game.humanConfig.stanceStand;

        this.action = Game.humanConfig.actions.STAND;
        this.run_frame = Game.humanConfig.firstRunFrame;
        this.valid = true;

        this.frame_counter = 0;
        this.wave_left = true;

        this.angles_rad = [];
        this.angles_deg = [];
        for (var i=0, len=this.angles_deg_goal.length; i<len; i++){
            this.angles_rad.push(0);
            this.angles_deg[i] = this.angles_deg_goal[i];
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
        if (this.action === Game.humanConfig.actions.STAND){
            if( Math.abs(this.position.x - this.game_state.ship.position.x) < Game.humanConfig.waveDistance){
                // START: WAVE
                this.action = Game.humanConfig.actions.WAVE;
                this.angles_deg_goal = Game.humanConfig.stanceStand;
                this.angles_deg_goal[Game.humanConfig.idx.torso_ang] = 100;
                this.frame_counter = Game.humanConfig.timerWave;
                this.wave_left = true;
            }
        }

        // Determine goal position
        var goal_x = this.home_x;
        var safehouse_x = this.game_state.structures[0].position.x;
        var safehouse_distance = Math.abs(safehouse_x - this.position.x);
        if(safehouse_distance < 400){
            goal_x = safehouse_x;

            if (safehouse_distance < 4 * Game.humanConfig.runSpeed){
                this.game_state.humans_rescued++;
                this.game_state.addPoints(g_.POINTS_RESCUED_HUMAN);
                this.valid = false;
            }
        }
        else if (this.game_state.ship.is_landed && !this.game_state.ship.human_on_board){
            var ship_distance = Math.abs(this.game_state.ship.position.x - this.position.x);
            if (ship_distance < 400){  //TODO: remove magic number
                goal_x = this.game_state.ship.position.x;

                if (ship_distance < 4 * Game.humanConfig.runSpeed){
                    this.game_state.ship.human_on_board = true;
                    this.game_state.addPoints(g_.POINTS_PICK_UP_HUMAN);
                    this.valid = false;
                }
            }
        }

        var goal_distance = goal_x - this.position.x;
        if (Math.abs(goal_distance) > Game.humanConfig.runSpeed * 2){
            // Run toward Goal
            if(goal_distance<0){
                this.action = Game.humanConfig.actions.RUN_LEFT;
            }
            else{
                this.action = Game.humanConfig.actions.RUN_RIGHT;
            }
        } else{
            if ((this.action === Game.humanConfig.actions.RUN_RIGHT) || (this.action === Game.humanConfig.actions.RUN_LEFT)){
                // Goal reached.  Stop Running.
                this.action = Game.humanConfig.actions.STAND;
                this.angles_deg_goal = Game.humanConfig.stanceStand;
            }
        }


        if (this.action === Game.humanConfig.actions.WAVE) {

            if( Math.abs(this.position.x - this.game_state.ship.position.x) >= Game.humanConfig.waveDistance){
                // START: STAND
                this.action = Game.humanConfig.actions.STAND;
                this.angles_deg_goal[Game.humanConfig.idx.shoulder1_ang] = -30;
                this.angles_deg_goal[Game.humanConfig.idx.arm1_ang] = -80;
                this.angles_deg_goal[Game.humanConfig.idx.torso_ang] = 80;
            }
            else{
                this.frame_counter-=paceFactor;
                if(this.frame_counter < 0){
                    this.angles_deg_goal[Game.humanConfig.idx.shoulder1_ang] = 40;
                    if (this.wave_left){
                        this.wave_left = false;
                        this.angles_deg_goal[Game.humanConfig.idx.arm1_ang] = 60;
                    }
                    else{
                        this.wave_left = true;
                        this.angles_deg_goal[Game.humanConfig.idx.arm1_ang] = 120;
                    }
                    this.frame_counter = Game.humanConfig.timerWave;
                }
            }
        }
        else if (this.action === Game.humanConfig.actions.RUN_RIGHT) {
            this.frame_counter-=paceFactor;
            if(this.frame_counter < 0){
                this.run_frame++;
                if(this.run_frame>=Game.humanConfig.numRunFrames){
                    this.run_frame=0;
                }
                this.angles_deg_goal = Game.humanConfig.runningAnimationRight[this.run_frame];
                this.frame_counter = Game.humanConfig.timerRun;
            }
            this.position.x += Game.humanConfig.runSpeed * paceFactor;
        }
        else if (this.action === Game.humanConfig.actions.RUN_LEFT) {
            this.frame_counter-=paceFactor;
            if(this.frame_counter < 0){
                this.run_frame++;
                if(this.run_frame>=Game.humanConfig.numRunFrames){
                    this.run_frame=0;
                }
                this.angles_deg_goal = Game.humanConfig.runningAnimationLeft[this.run_frame];
                this.frame_counter = Game.humanConfig.timerRun;
            }
            this.position.x -= Game.humanConfig.runSpeed * paceFactor;
        }

        // Move toward goal angles
        for (var i=0, len=this.angles_deg_goal.length; i<len; i++){
            var delta = this.angles_deg_goal[i] - this.angles_deg[i];
            var update;
            if(delta !==0){
                if(i!==Game.humanConfig.idx.jump){
                    update = Flynn.Util.minMaxBound( delta, -Game.humanConfig.limbSpeed*paceFactor, Game.humanConfig.limbSpeed*paceFactor);
                }
                else{
                    update = Flynn.Util.minMaxBound( delta, -Game.humanConfig.jumpSpeed*paceFactor, Game.humanConfig.jumpSpeed*paceFactor);
                }

                this.angles_deg[i] += update;
            }
        }
    },

    render: function(ctx){

        this.translate_angles();

        var pelvis_1_height =
            Game.humanConfig.thighLength * Math.sin(this.angles_rad[Game.humanConfig.idx.hip1_ang]) +
            Game.humanConfig.shinLength * Math.sin(this.angles_rad[Game.humanConfig.idx.knee1_ang]);
        var pelvis_2_height =
            Game.humanConfig.thighLength * Math.sin(this.angles_rad[Game.humanConfig.idx.hip2_ang]) +
            Game.humanConfig.shinLength * Math.sin(this.angles_rad[Game.humanConfig.idx.knee2_ang]);
        var pelvis_height = Math.max(pelvis_1_height, pelvis_2_height) + this.angles_deg[Game.humanConfig.idx.jump];
        var pelvis_pt = [
            this.position.x - Flynn.mcp.viewport.x,
            this.position.y - pelvis_height - Flynn.mcp.viewport.y
        ];
        var knee1_pt = [
            pelvis_pt[0] + Game.humanConfig.thighLength * Math.cos(this.angles_rad[Game.humanConfig.idx.hip1_ang]),
            pelvis_pt[1] + Game.humanConfig.thighLength * Math.sin(this.angles_rad[Game.humanConfig.idx.hip1_ang]),
        ];
        var foot1_pt = [
            knee1_pt[0] + Game.humanConfig.shinLength * Math.cos(this.angles_rad[Game.humanConfig.idx.knee1_ang]),
            knee1_pt[1] + Game.humanConfig.shinLength * Math.sin(this.angles_rad[Game.humanConfig.idx.knee1_ang]),
        ];
        var knee2_pt = [
            pelvis_pt[0] + Game.humanConfig.thighLength * Math.cos(this.angles_rad[Game.humanConfig.idx.hip2_ang]),
            pelvis_pt[1] + Game.humanConfig.thighLength* Math.sin(this.angles_rad[Game.humanConfig.idx.hip2_ang]),
        ];
        var foot2_pt = [
            knee2_pt[0] + Game.humanConfig.shinLength * Math.cos(this.angles_rad[Game.humanConfig.idx.knee2_ang]),
            knee2_pt[1] + Game.humanConfig.shinLength * Math.sin(this.angles_rad[Game.humanConfig.idx.knee2_ang]),
        ];
        var neck_pt = [
            pelvis_pt[0] + Game.humanConfig.torsoLength * Math.cos(this.angles_rad[Game.humanConfig.idx.torso_ang]),
            pelvis_pt[1] + Game.humanConfig.torsoLength * Math.sin(this.angles_rad[Game.humanConfig.idx.torso_ang]),
        ];
        var shoulder_pt = [
            pelvis_pt[0] + Game.humanConfig.shoulderHeight * Math.cos(this.angles_rad[Game.humanConfig.idx.torso_ang]),
            pelvis_pt[1] + Game.humanConfig.shoulderHeight * Math.sin(this.angles_rad[Game.humanConfig.idx.torso_ang]),
        ];
        var elbow1_pt = [
            shoulder_pt[0] + Game.humanConfig.armLength * Math.cos(this.angles_rad[Game.humanConfig.idx.shoulder1_ang]),
            shoulder_pt[1] + Game.humanConfig.armLength * Math.sin(this.angles_rad[Game.humanConfig.idx.shoulder1_ang]),
        ];
        var hand1_pt = [
            elbow1_pt[0] + Game.humanConfig.foreArmLength * Math.cos(this.angles_rad[Game.humanConfig.idx.arm1_ang]),
            elbow1_pt[1] + Game.humanConfig.foreArmLength * Math.sin(this.angles_rad[Game.humanConfig.idx.arm1_ang]),
        ];
        var elbow2_pt = [
            shoulder_pt[0] + Game.humanConfig.armLength * Math.cos(this.angles_rad[Game.humanConfig.idx.shoulder2_ang]),
            shoulder_pt[1] + Game.humanConfig.armLength * Math.sin(this.angles_rad[Game.humanConfig.idx.shoulder2_ang]),
        ];
        var hand2_pt = [
            elbow2_pt[0] + Game.humanConfig.foreArmLength * Math.cos(this.angles_rad[Game.humanConfig.idx.arm2_ang]),
            elbow2_pt[1] + Game.humanConfig.foreArmLength * Math.sin(this.angles_rad[Game.humanConfig.idx.arm2_ang]),
        ];
        var head_pt = [
            pelvis_pt[0] + (Game.humanConfig.torsoLength + Game.humanConfig.headRadius) * Math.cos(this.angles_rad[Game.humanConfig.idx.torso_ang]),
            pelvis_pt[1] + (Game.humanConfig.torsoLength + Game.humanConfig.headRadius) * Math.sin(this.angles_rad[Game.humanConfig.idx.torso_ang]),
        ];

        ctx.vectorStart(this.color);

        // Leg 1
        ctx.vectorMoveTo(pelvis_pt[0], pelvis_pt[1]);
        ctx.vectorLineTo(knee1_pt[0], knee1_pt[1]);
        ctx.vectorLineTo(foot1_pt[0], foot1_pt[1]);
        // Leg 2
        ctx.vectorMoveTo(pelvis_pt[0], pelvis_pt[1]);
        ctx.vectorLineTo(knee2_pt[0], knee2_pt[1]);
        ctx.vectorLineTo(foot2_pt[0], foot2_pt[1]);
        // Torso
        ctx.vectorMoveTo(pelvis_pt[0], pelvis_pt[1]);
        ctx.vectorLineTo(neck_pt[0], neck_pt[1]);
        // Arm 1
        ctx.vectorMoveTo(shoulder_pt[0], shoulder_pt[1]);
        ctx.vectorLineTo(elbow1_pt[0], elbow1_pt[1]);
        ctx.vectorLineTo(hand1_pt[0], hand1_pt[1]);
        // Arm 2
        ctx.vectorMoveTo(shoulder_pt[0], shoulder_pt[1]);
        ctx.vectorLineTo(elbow2_pt[0], elbow2_pt[1]);
        ctx.vectorLineTo(hand2_pt[0], hand2_pt[1]);

        // Head
        // Note: The head is so small that we'll "fake" it with a circle,
        //       rather than decompose it into a vector polygon.      
        ctx.graphics.drawCircle(
            head_pt[0],
            head_pt[1],
            Game.humanConfig.headRadius);
        ctx.vectorEnd();

        // ctx.beginPath();
        // ctx.arc(head_pt[0], head_pt[1], Game.humanConfig.headRadius, 0, 2 * Math.PI, false);
        // ctx.stroke();
    }
});

}()); // "use strict" wrapper