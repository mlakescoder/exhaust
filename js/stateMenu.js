//--------------------------------------------
// StateMenu class
//    Startup screen
//--------------------------------------------

var StateMenu = FlynnState.extend({

	init: function(mcp){
		this._super(mcp);

		this.canvasWidth = mcp.canvas.ctx.width;
		this.canvasHeight = mcp.canvas.ctx.height;

		this.start_sound = new Howl({
			src: ['sounds/Tripple_blip.ogg','sounds/Tripple_blip.mp3'],
			volume: 0.5
		});

        this.insert_coin_sound = new Howl({
            src: ['sounds/InsertCoin.ogg','sounds/InsertCoin.mp3'],
            volume: 0.5
        });
	},

	handleInputs: function(input, paceFactor) {
		// Metrics toggle
        if(this.mcp.developerModeEnabled) {
            if (input.virtualButtonIsPressed("dev_metrics")) {
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
        }
        if(this.mcp.arcadeModeEnabled) {
            if (input.virtualButtonIsPressed("quarter")) {
                this.mcp.credits += 1;
                this.insert_coin_sound.play();
            }
        }

		if (  ( !this.mcp.arcadeModeEnabled && input.virtualButtonIsPressed("enter")) ||
            ( this.mcp.arcadeModeEnabled && (this.mcp.credits > 0) && input.virtualButtonIsPressed("start_1")))
        {
            this.mcp.credits -= 1;
			this.mcp.nextState = States.GAME;
			this.start_sound.play();
		}

        if (input.virtualButtonIsPressed("config")) {
            this.mcp.nextState = States.CONFIG;
        }
	},

	update: function(paceFactor) {

	},

	render: function(ctx) {
        ctx.clearAll();
        var title_x = 160;
        var title_y = 150;
        var title_step = 5;

        // Font Test
        //ctx.vectorText("!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`",
        //	2.5, 30, 30, null, FlynnColors.MAGENTA);
        //ctx.vectorText("Unimplemented:{|}~",
        //	2.5, 30, 55, null, FlynnColors.MAGENTA);

        for (var angle = 0; angle < Math.PI + 0.1; angle += Math.PI) {
            x_pos = 300;
            y_pos = 50;
            ctx.vectorText("EXHAUST", 10, x_pos, y_pos, null, FlynnColors.ORANGE);
            ctx.vectorText("EXHAUST", 10,  x_pos + 3, y_pos +3, null, FlynnColors.RED);
        }

        ctx.vectorText("VERSION 1.3", 1.5, null, 140, null, FlynnColors.ORANGE);

        var startText;
        var controlsText;
        // if (this.mcp.arcadeModeEnabled) {
        //     startText =     "        PRESS START";
        //     //              #########################################
        //     controlsText = "LEFT/RIGHT BUTTON TO THRUST/SHOOT";
        //     this.mcp.custom.thrustPrompt = "PRESS LEFT BUTTON TO THRUST";
        //     this.mcp.custom.shootPrompt = "PRESS RIGHT BUTTON TO SHOOT";
        //     ctx.vectorText(this.mcp.credits + " Credits", 2, 10, this.canvasHeight - 20, null, FlynnColors.YELLOW);
        // }
        // else {
            if (!this.mcp.browserSupportsTouch) {
                startText = "PRESS <ENTER> TO START";
                controlsText =
                    "ROTATE LEFT:" +
                    this.mcp.input.getVirtualButtonBoundKeyName("rotate left") +
                    "      ROTATE RIGHT:" +
                    this.mcp.input.getVirtualButtonBoundKeyName("rotate right") +
                    "      THRUST:" +
                    this.mcp.input.getVirtualButtonBoundKeyName("thrust");
                this.mcp.custom.thrustPrompt = "PRESS SPACE TO THRUST";
            }
            else{
                startText = "PUSH AYWHERE TO START";
                controlsText = "ROTATE LEFT:TAP FAR LEFT       ROTATE RIGHT: TAP MID LEFT       THRUST:TAP RIGHT";
                this.mcp.custom.thrustPrompt = "PRESS RIGHT TO THRUST";
            }

        //      this.mcp.custom.shootPrompt = "PRESS SPACE TO SHOOT";
        //     } else {
        //         startText = "TAP ANYWHERE TO START";
        //         //              #########################################
        //         controlsText = "TAP LEFT TO THRUST   TAP RIGHT TO SHOOT";
        //         this.mcp.custom.thrustPrompt = "TAP LEFT TO THRUST";
        //         this.mcp.custom.shootPrompt = "TAP RIGHT TO SHOOT";
        //     }
        // }
        ctx.vectorText(controlsText, 2, null, 280, null, FlynnColors.YELLOW);
        if(!this.mcp.arcadeModeEnabled || (this.mcp.arcadeModeEnabled && (this.mcp.credits > 0))) {
            if (Math.floor(this.mcp.clock / 40) % 2 == 1) {
                ctx.vectorText(startText, 2, null, 300, null, FlynnColors.CYAN);
            }
        }

        ctx.vectorText("RESCUE THE HUMANS.  AVOID THE ALIENS.  YOU HAVE NO WEAPONS.", 1.8, null, 500, null, FlynnColors.ORANGE);
        ctx.vectorText("EXCEPT MAYBE....", 1.8, null, 520, null, FlynnColors.ORANGE);

		ctx.vectorText("WRITTEN BY ERIC MOYER (FIENDFODDER) FOR LUDAM DARE #32", 1.5, null, 700, null, FlynnColors.ORANGE);
        ctx.vectorText('PRESS <ESCAPE> TO CONFIGURE CONTROLS', 1.5, null, 715, null, FlynnColors.ORANGE);


	}

});