//--------------------------------------------
// StateMenu class
//    Startup screen
//--------------------------------------------
var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.StateMenu = Flynn.State.extend({
    VIEW_PHASES:{
        NORMAL: 0,
        SCORES: 1,
        CREDITS: 2,
    },
    VIEW_PHASE_TICKS_NORMAL: 60 * 7,
    VIEW_PHASE_TICKS_SCORES: 60 * 4,
    VIEW_PHASE_TICKS_CREDITS: 60 * 4,

    init: function(){
        this.view_phase = this.VIEW_PHASES.NORMAL;

        this.timers = new Flynn.Timers();
        this.timers.add("view_phase", this.VIEW_PHASE_TICKS_NORMAL, null);

        this.va_logo = new Flynn.VALogo(
            60,
            Flynn.mcp.canvasHeight - 60,
            1,
            false);
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
                Game.sounds.insert_coin.play();
            }
        }

        if (  ( !Flynn.mcp.arcadeModeEnabled && input.virtualButtonWasPressed("UI_enter"))
           || (  Flynn.mcp.arcadeModeEnabled && (Flynn.mcp.credits > 0)
              && (  input.virtualButtonWasPressed("UI_start1") 
                 || input.virtualButtonWasPressed("UI_start2") )))
        {
            Flynn.mcp.credits -= 1;
            Flynn.mcp.changeState(Game.States.GAME);
            Game.sounds.start.play();
        }

        if (input.virtualButtonWasPressed("UI_escape")) {
            Flynn.mcp.changeState(Game.States.CONFIG);
        }

        if (input.virtualButtonWasPressed("UI_exit") && Flynn.mcp.backEnabled){
            window.history.back();
        }
    },

    update: function(paceFactor) {
        // View phase transitions
        this.timers.update(paceFactor);
        if(this.timers.hasExpired("view_phase")){
            switch(this.view_phase){
                case this.VIEW_PHASES.NORMAL:
                    this.view_phase = this.VIEW_PHASES.SCORES;
                    this.timers.set("view_phase", this.VIEW_PHASE_TICKS_SCORES);
                    break;
                case this.VIEW_PHASES.SCORES:
                    this.view_phase = this.VIEW_PHASES.CREDITS;
                    this.timers.set("view_phase", this.VIEW_PHASE_TICKS_CREDITS);
                    break;
                case this.VIEW_PHASES.CREDITS:
                    this.view_phase = this.VIEW_PHASES.NORMAL;
                    this.timers.set("view_phase", this.VIEW_PHASE_TICKS_NORMAL);
                    break;
            }
        }

        this.va_logo.update(paceFactor);
    },

    render: function(ctx) {
        ctx.clearAll();
        var i, len, leader;
        var is_world = false;

        var title = "EXHAUST";
        var x_pos = Game.CANVAS_WIDTH /2;
        var y_pos = 50;
        ctx.vectorText(title, 10, x_pos, y_pos, 'center', Flynn.Colors.ORANGE, is_world, Flynn.Font.Block);
        ctx.vectorText(title, 10,  x_pos + 3, y_pos +3, 'center', Flynn.Colors.RED, is_world, Flynn.Font.Block);
        ctx.vectorText("VERSION " + Game.VERSION, 1.5, null, 180, null, Flynn.Colors.ORANGE);

        var startText;
        var controlsText;
        var credit_text, y_step, y_text, line_text, line_color;

        switch(this.view_phase){
            case this.VIEW_PHASES.NORMAL:
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
                        startText = "TAP AYWHERE TO START";
                        controlsText = "ROTATE:JOYSTICK (LEFT)          THRUST:BUTTON (RIGHT)";
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

                ctx.vectorText("CREATED BY ERIC MOYER (FIENDFODDER)", 1.5, null, 700, null, Flynn.Colors.ORANGE);
                ctx.vectorText('PRESS <ESCAPE> TO CONFIGURE CONTROLS', 1.5, null, 715, null, Flynn.Colors.GRAY);
                if(Flynn.mcp.backEnabled){
                    ctx.vectorText('PRESS <TAB> TO EXIT GAME', 1.5, null, 730, null, Flynn.Colors.GRAY);
                }
                break;

            case this.VIEW_PHASES.SCORES:
                var y_top = 315;
                ctx.vectorText('HIGH SCORES', 2, null, y_top-50, null, Flynn.Colors.ORANGE);
                for (i = 0, len = Game.config.leaderboard.leaderList.length; i < len; i++) {
                    leader = Game.config.leaderboard.leaderList[i];
                    ctx.vectorText(leader.name, 2, 360, y_top+25*i, 'left', Flynn.Colors.ORANGE);
                    ctx.vectorText(leader.score, 2, 660, y_top+25*i,'right', Flynn.Colors.ORANGE);
                }
                break;

            case this.VIEW_PHASES.CREDITS:
                credit_text = [
                    'CREDITS',
                    '',
                    "CREATED BY ERIC MOYER",
                    '',
                    'MUSIC "DST-EXPANDER" BY MORTEN BARFOD S0EGAARD',
                    'LITTLE ROBOT SOUND FACTORY',
                    'WWW.LITTLEROBOTSOUNDFACTORY.COM',
                    '',
                    'MORE GAMES AT VECTORALCHEMY.COM',
                    '',
                    'WANT TO HELP?',
                    '*WWW.PATREON.COM/VECTORALCHEMY'
                ];
                y_step = 25;
                y_text = 315;
                for(i=0; i<credit_text.length; i++){
                    line_text = credit_text[i];
                    line_color = Flynn.Colors.ORANGE;
                    if(line_text.startsWith('*')){
                        line_color = Flynn.Colors.RED;
                        line_text = line_text.substring(1);
                    }
                    ctx.vectorText(line_text, 2, null, y_text + y_step*i, null, line_color);
                }

                break;
        } // end switch

        Flynn.mcp.renderLogo(ctx);
        this.va_logo.render(ctx);
    }

});

}()); // "use strict" wrapper