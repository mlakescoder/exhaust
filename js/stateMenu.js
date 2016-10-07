//--------------------------------------------
// StateMenu class
//    Startup screen
//--------------------------------------------
if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.StateMenu = Flynn.State.extend({

    init: function(){

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
        if(Flynn.mcp.developerModeEnabled) {
            if (input.virtualButtonWasPressed("dev_metrics")) {
                Flynn.mcp.canvas.showMetrics = !Flynn.mcp.canvas.showMetrics;
            }
            
            // Toggle DEV pacing mode slow mo
            if (input.virtualButtonWasPressed("dev_slow_mo")){
                Flynn.mcp.toggleDevPacingSlowMo();
            }

            // Toggle DEV pacing mode fps 20
            if (input.virtualButtonWasPressed("dev_fps_20")){
                Flynn.mcp.toggleDevPacingFps20();
            }
        }
        if(Flynn.mcp.arcadeModeEnabled) {
            if (input.virtualButtonWasPressed("UI_quarter")) {
                Flynn.mcp.credits += 1;
                this.insert_coin_sound.play();
            }
        }

        if (  ( !Flynn.mcp.arcadeModeEnabled && input.virtualButtonWasPressed("UI_enter"))
           || (  Flynn.mcp.arcadeModeEnabled && (Flynn.mcp.credits > 0)
              && (  input.virtualButtonWasPressed("UI_start1") 
                 || input.virtualButtonWasPressed("UI_start2") )))
        {
            Flynn.mcp.credits -= 1;
            Flynn.mcp.changeState(Game.States.GAME);
            this.start_sound.play();
        }

        if (input.virtualButtonWasPressed("UI_escape")) {
            Flynn.mcp.changeState(Game.States.CONFIG);
        }

        if (input.virtualButtonWasPressed("UI_exit") && Flynn.mcp.backEnabled){
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
            ctx.vectorText("EXHAUST", 10, x_pos, y_pos, 'left', Flynn.Colors.ORANGE);
            ctx.vectorText("EXHAUST", 10,  x_pos + 3, y_pos +3, 'left', Flynn.Colors.RED);
        }

        ctx.vectorText("VERSION 1.6", 1.5, null, 140, null, Flynn.Colors.ORANGE);

        var startText;
        var controlsText;
        if (Flynn.mcp.arcadeModeEnabled) {
            startText = "PRESS START";
            controlsText = "LEFTMOST WHITE BUTTONS TO ROTATE        FAR RIGHT WHITE BUTTON TO THRUST";
            // Game.config.thrustPrompt = "PRESS LEFT BUTTON TO THRUST";
            // Game.config.shootPrompt = "PRESS RIGHT BUTTON TO SHOOT";
            ctx.vectorText(Flynn.mcp.credits + " Credits", 2, 10, Game.CANVAS_HEIGHT - 20, 'left', Flynn.Colors.ORANGE);
        }
        else {
            if (!Flynn.mcp.browserSupportsTouch) {
                startText = "PRESS <ENTER> TO START";
                controlsText =
                    "ROTATE LEFT:" +
                    Flynn.mcp.input.getVirtualButtonBoundKeyName("rotate left") +
                    "      ROTATE RIGHT:" +
                    Flynn.mcp.input.getVirtualButtonBoundKeyName("rotate right") +
                    "      THRUST:" +
                    Flynn.mcp.input.getVirtualButtonBoundKeyName("thrust");
                Game.config.thrustPrompt = "PRESS SPACE TO THRUST";
            }
            else{
                startText = "PUSH AYWHERE TO START";
                controlsText = "ROTATE LEFT:TAP FAR LEFT       ROTATE RIGHT: TAP MID LEFT       THRUST:TAP RIGHT";
                Game.config.thrustPrompt = "PRESS RIGHT TO THRUST";
            }
        }

        ctx.vectorText(controlsText, 2, null, 280, null, Flynn.Colors.YELLOW);
        if(!Flynn.mcp.arcadeModeEnabled || (Flynn.mcp.arcadeModeEnabled && (Flynn.mcp.credits > 0))) {
            if (Math.floor(Flynn.mcp.clock / 40) % 2 == 1) {
                ctx.vectorText(startText, 2, null, 300, null, Flynn.Colors.CYAN);
            }
        }

        ctx.vectorText("RESCUE THE HUMANS.  AVOID THE ALIENS.  YOU HAVE NO WEAPONS.", 1.8, null, 500, null, Flynn.Colors.ORANGE);
        ctx.vectorText("EXCEPT MAYBE....", 1.8, null, 520, null, Flynn.Colors.ORANGE);

        ctx.vectorText("WRITTEN BY ERIC MOYER (FIENDFODDER) FOR LUDAM DARE #32", 1.5, null, 700, null, Flynn.Colors.ORANGE);
        ctx.vectorText('PRESS <ESCAPE> TO CONFIGURE CONTROLS', 1.5, null, 715, null, Flynn.Colors.ORANGE);
        if(Flynn.mcp.backEnabled){
            ctx.vectorText('PRESS <TAB> TO EXIT GAME', 1.5, null, 730, null, Flynn.Colors.ORANGE);
        }

        Flynn.mcp.renderLogo(ctx);
    }

});