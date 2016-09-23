if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.CANVAS_HEIGHT = 768;
Game.CANVAS_WIDTH = 1024;
Game.SPEED_FACTOR = 0.7;

Game.States = {
    NO_CHANGE: 0,
    MENU:      1,
    CONFIG:    2,
    GAME:      3,
    END:       4
};

Game.Main = Class.extend({
    
    init: function() {
        "use strict";

        var self = this;
        
        this.input = new Flynn.InputHandler();

        this.mcp = new Flynn.Mcp(Game.CANVAS_WIDTH, Game.CANVAS_HEIGHT, this.input, Game.States.NO_CHANGE, Game.SPEED_FACTOR);
        this.mcp.setStateBuilderFunc(
            function(state){
                switch(state){
                    case Game.States.MENU:
                        return new Game.StateMenu(self.mcp);
                    case Game.States.GAME:
                        return new Game.StateGame(self.mcp);
                    case Game.States.END:
                        return new Flynn.StateEnd(
                            self.mcp,
                            self.mcp.custom.score,
                            self.mcp.custom.leaderboard,
                            Flynn.Colors.ORANGE,
                            'HIGH SCORES',
                            'YOU MADE IT TO THE HIGH SCORE LIST!',
                            Game.States.MENU     // Parent state
                            );
                    case Game.States.CONFIG:
                        return new Flynn.StateConfig(
                            self.mcp,
                            Flynn.Colors.ORANGE,
                            Flynn.Colors.YELLOW,
                            Flynn.Colors.CYAN,
                            Flynn.Colors.MAGENTA,
                            Game.States.MENU     // Parent state
                            );
                }
            }
        );
        this.mcp.nextState = Game.States.MENU;
        this.mcp.custom.score = 0;
        this.mcp.custom.leaderboard = new Flynn.Leaderboard(
            this.mcp,
            ['name', 'score'],  // attributeList
            6,                  // maxItems
            true                // sortDescending
            );
        this.mcp.custom.leaderboard.setDefaultList(
            [
                {'name': 'FIENDFODDER', 'score': 2000},
                {'name': 'FLOATINHEAD', 'score': 1300},
                {'name': 'WILLIAMS',    'score': 1200},
                {'name': 'GORLIN',      'score': 1100},
                {'name': 'DELMAN',      'score': 600 },
                {'name': 'BURNESS',     'score': 500 },
            ]);
        this.mcp.custom.leaderboard.loadFromCookies();
        this.mcp.custom.leaderboard.saveToCookies();

        // Setup inputs
        if(!this.mcp.iCadeModeEnabled){
            this.input.addVirtualButton('rotate left', Flynn.KeyboardMap.z, Flynn.BUTTON_CONFIGURABLE);
            this.input.addVirtualButton('rotate right', Flynn.KeyboardMap.x, Flynn.BUTTON_CONFIGURABLE);
            this.input.addVirtualButton('thrust', Flynn.KeyboardMap.spacebar, Flynn.BUTTON_CONFIGURABLE);
        }
        else{
            this.input.addVirtualButton('rotate left', Flynn.KeyboardMap.icade_t1, Flynn.BUTTON_CONFIGURABLE);
            this.input.addVirtualButton('rotate right', Flynn.KeyboardMap.icade_t2, Flynn.BUTTON_CONFIGURABLE);
            this.input.addVirtualButton('thrust', Flynn.KeyboardMap.icade_t3, Flynn.BUTTON_CONFIGURABLE);
        }

        if(this.mcp.developerModeEnabled){
            this.input.addVirtualButton('dev_metrics', Flynn.KeyboardMap.num_6, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_slow_mo', Flynn.KeyboardMap.num_7, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_fps_20', Flynn.KeyboardMap.backslash, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_add_points', Flynn.KeyboardMap.num_8, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_die', Flynn.KeyboardMap.num_9, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_rescue', Flynn.KeyboardMap.num_0, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_base', Flynn.KeyboardMap.dash, Flynn.BUTTON_NOT_CONFIGURABLE);
            this.input.addVirtualButton('dev_kill_human', Flynn.KeyboardMap.right_bracket, Flynn.BUTTON_NOT_CONFIGURABLE);
        }
        if(this.mcp.arcadeModeEnabled && !this.mcp.iCadeModeEnabled){
            this.input.addVirtualButton('thrust', Flynn.KeyboardMap.r, Flynn.BUTTON_CONFIGURABLE);
            // In arcade mode re-bind rotate right to spacebar
            this.input.addVirtualButton('rotate right', Flynn.KeyboardMap.spacebar, Flynn.BUTTON_CONFIGURABLE);
        }

        // Options
        this.mcp.optionManager.addOptionFromVirtualButton('rotate left');
        this.mcp.optionManager.addOptionFromVirtualButton('rotate right');
        this.mcp.optionManager.addOptionFromVirtualButton('thrust');
        this.mcp.optionManager.addOption('musicEnabled', Flynn.OptionType.BOOLEAN, true, true, 'MUSIC', null, null);
        this.mcp.optionManager.addOption('resetScores', Flynn.OptionType.COMMAND, true, true, 'RESET HIGH SCORES', null,
            function(){self.resetScores();});

        // Restore user option settings from cookies
        this.mcp.optionManager.loadFromCookies();
        
        // Set resize handler and force a resize
        this.mcp.setResizeFunc( function(width, height){
            if(self.mcp.browserSupportsTouch){
                self.input.addTouchRegion("rotate left",0,0,width/4,height); // Left quarter
                self.input.addTouchRegion("rotate right",width/4+1,0,width/2,height); // Left second quarter
                self.input.addTouchRegion("thrust",width/2+1,0,width,height); // Right half
                self.input.addTouchRegion("UI_enter",0,0,width,height); // Whole screen
            }
        });
        this.mcp.resize();
    },

    resetScores: function(){
        this.mcp.custom.leaderboard.restoreDefaults();
    },

    run: function() {
        // Start the game
        this.mcp.run();
    }
});