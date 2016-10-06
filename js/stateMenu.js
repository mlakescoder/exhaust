//--------------------------------------------
// StateMenu class
//    Startup screen
//--------------------------------------------
if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.StateMenu = Flynn.State.extend({

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
            if (input.virtualButtonIsPressed("UI_quarter")) {
                this.mcp.credits += 1;
                this.insert_coin_sound.play();
            }
        }

        if (  ( !this.mcp.arcadeModeEnabled && input.virtualButtonIsPressed("UI_enter"))
           || (  this.mcp.arcadeModeEnabled && (this.mcp.credits > 0)
              && (  input.virtualButtonIsPressed("UI_start1") 
                 || input.virtualButtonIsPressed("UI_start2") )))
        {
            this.mcp.credits -= 1;
            this.mcp.nextState = Game.States.GAME;
            this.start_sound.play();
        }

        if (input.virtualButtonIsPressed("UI_escape")) {
            this.mcp.nextState = Game.States.CONFIG;
        }

        if (input.virtualButtonIsPressed("UI_exit") && this.mcp.backEnabled){
            window.history.back();
        }
    },

    update: function(paceFactor) {

    },

    render: function(ctx) {
        ctx.clearAll();
        var title_x = 160;
        var title_y = 150;
        var title_step = 5;

        for (var angle = 0; angle < Math.PI + 0.1; angle += Math.PI) {
            var x_pos = 300;
            var y_pos = 50;
            ctx.vectorText("EXHAUST", 10, x_pos, y_pos, null, Flynn.Colors.ORANGE);
            ctx.vectorText("EXHAUST", 10,  x_pos + 3, y_pos +3, null, Flynn.Colors.RED);
        }

        ctx.vectorText("VERSION 1.6", 1.5, null, 140, null, Flynn.Colors.ORANGE);

        var startText;
        var controlsText;
        if (this.mcp.arcadeModeEnabled) {
            startText = "PRESS START";
            controlsText = "LEFTMOST WHITE BUTTONS TO ROTATE        FAR RIGHT WHITE BUTTON TO THRUST";
            // this.mcp.custom.thrustPrompt = "PRESS LEFT BUTTON TO THRUST";
            // this.mcp.custom.shootPrompt = "PRESS RIGHT BUTTON TO SHOOT";
            ctx.vectorText(this.mcp.credits + " Credits", 2, 10, this.canvasHeight - 20, null, Flynn.Colors.ORANGE);
        }
        else {
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
        }

        ctx.vectorText(controlsText, 2, null, 280, null, Flynn.Colors.YELLOW);
        if(!this.mcp.arcadeModeEnabled || (this.mcp.arcadeModeEnabled && (this.mcp.credits > 0))) {
            if (Math.floor(this.mcp.clock / 40) % 2 == 1) {
                ctx.vectorText(startText, 2, null, 300, null, Flynn.Colors.CYAN);
            }
        }

        ctx.vectorText("RESCUE THE HUMANS.  AVOID THE ALIENS.  YOU HAVE NO WEAPONS.", 1.8, null, 500, null, Flynn.Colors.ORANGE);
        ctx.vectorText("EXCEPT MAYBE....", 1.8, null, 520, null, Flynn.Colors.ORANGE);

        ctx.vectorText("WRITTEN BY ERIC MOYER (FIENDFODDER) FOR LUDAM DARE #32", 1.5, null, 700, null, Flynn.Colors.ORANGE);
        ctx.vectorText('PRESS <ESCAPE> TO CONFIGURE CONTROLS', 1.5, null, 715, null, Flynn.Colors.ORANGE);
        if(this.mcp.backEnabled){
            ctx.vectorText('PRESS <TAB> TO EXIT GAME', 1.5, null, 730, null, Flynn.Colors.ORANGE);
        }

        ctx.vectorText('FLYNN ' + this.mcp.version, 1.0, this.canvasWidth-3, this.canvasHeight-10, 0, Flynn.Colors.GRAY);
    }

});