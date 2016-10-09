var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.VERSION = '1.7';
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

        Flynn.init(
            Game.CANVAS_WIDTH,
            Game.CANVAS_HEIGHT, 
            Game.States.NO_CHANGE,
            Game.SPEED_FACTOR,
            function(state){
                switch(state){
                    case Game.States.MENU:
                        return new Game.StateMenu();
                    case Game.States.GAME:
                        return new Game.StateGame();
                    case Game.States.END:
                        return new Flynn.StateEnd(
                            Game.config.score,
                            Game.config.leaderboard,
                            Flynn.Colors.ORANGE,
                            'HIGH SCORES',
                            'YOU MADE IT TO THE HIGH SCORE LIST!',
                            Game.States.MENU     // Parent state
                            );
                    case Game.States.CONFIG:
                        return new Flynn.StateConfig(
                            Flynn.Colors.ORANGE,
                            Flynn.Colors.YELLOW,
                            Flynn.Colors.CYAN,
                            Flynn.Colors.MAGENTA,
                            Game.States.MENU     // Parent state
                            );
                }
            }
        );
        Flynn.mcp.changeState(Game.States.MENU);

        Game.config = {};
        Game.config.score = 0;
        Game.config.leaderboard = new Flynn.Leaderboard(
            ['name', 'score'],  // attributeList
            6,                  // maxItems
            true                // sortDescending
            );
        Game.config.leaderboard.setDefaultList(
            [
                {'name': 'FIENDFODDER', 'score': 2000},
                {'name': 'FLOATINHEAD', 'score': 1300},
                {'name': 'WILLIAMS',    'score': 1200},
                {'name': 'GORLIN',      'score': 1100},
                {'name': 'DELMAN',      'score': 600 },
                {'name': 'BURNESS',     'score': 500 },
            ]);
        Game.config.leaderboard.loadFromCookies();
        Game.config.leaderboard.saveToCookies();

        // Setup inputs
        var input = Flynn.mcp.input;
        if(!Flynn.mcp.iCadeModeEnabled){
            input.addVirtualButton('rotate left',    Flynn.KeyboardMap.z,         Flynn.BUTTON_CONFIGURABLE);
            input.addVirtualButton('rotate right',   Flynn.KeyboardMap.x,         Flynn.BUTTON_CONFIGURABLE);
            input.addVirtualButton('thrust',         Flynn.KeyboardMap.spacebar,  Flynn.BUTTON_CONFIGURABLE);
        }
        else{
            input.addVirtualButton('rotate left',    Flynn.KeyboardMap.icade_t1,  Flynn.BUTTON_CONFIGURABLE);
            input.addVirtualButton('rotate right',   Flynn.KeyboardMap.icade_t2,  Flynn.BUTTON_CONFIGURABLE);
            input.addVirtualButton('thrust',         Flynn.KeyboardMap.icade_t3,  Flynn.BUTTON_CONFIGURABLE);
        }

        if(Flynn.mcp.developerModeEnabled){
            input.addVirtualButton('dev_metrics',    Flynn.KeyboardMap.num_6,     Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_slow_mo',    Flynn.KeyboardMap.num_7,     Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_fps_20',     Flynn.KeyboardMap.backslash, Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_add_points', Flynn.KeyboardMap.num_8,     Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_die',        Flynn.KeyboardMap.num_9,     Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_rescue',     Flynn.KeyboardMap.num_0,     Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_base',       Flynn.KeyboardMap.dash,      Flynn.BUTTON_NOT_CONFIGURABLE);
            input.addVirtualButton('dev_kill_human', Flynn.KeyboardMap.right_bracket, Flynn.BUTTON_NOT_CONFIGURABLE);
        }
        if(Flynn.mcp.arcadeModeEnabled && !Flynn.mcp.iCadeModeEnabled){
            input.addVirtualButton('thrust', Flynn.KeyboardMap.r, Flynn.BUTTON_CONFIGURABLE);
            // In arcade mode re-bind rotate right to spacebar
            input.addVirtualButton('rotate right', Flynn.KeyboardMap.spacebar, Flynn.BUTTON_CONFIGURABLE);
        }

        // Options
        Flynn.mcp.optionManager.addOptionFromVirtualButton('rotate left');
        Flynn.mcp.optionManager.addOptionFromVirtualButton('rotate right');
        Flynn.mcp.optionManager.addOptionFromVirtualButton('thrust');
        Flynn.mcp.optionManager.addOption('musicEnabled', Flynn.OptionType.BOOLEAN, true, true, 'MUSIC', null, null);
        Flynn.mcp.optionManager.addOption('resetScores', Flynn.OptionType.COMMAND, true, true, 'RESET HIGH SCORES', null,
            function(){self.resetScores();});

        // Restore user option settings from cookies
        Flynn.mcp.optionManager.loadFromCookies();
        
        // Setup touch controls
        var button_size   = 80;
        var joystick_radius = 60;
        var x, y;
        if(Flynn.mcp.browserSupportsTouch){

            Flynn.mcp.input.addVirtualJoystick({
                radius: joystick_radius,
                pos: {
                    x: 1.1*joystick_radius, 
                    y: Game.CANVAS_HEIGHT - 1.1*joystick_radius
                },
                name: 'stick',
                button_map: {
                    left:  'rotate left',
                    right: 'rotate right'
                },
                visible_states: [Game.States.GAME],
            });

            x = Game.CANVAS_WIDTH  - 1.1*button_size;
            y = Game.CANVAS_HEIGHT - 1.1*button_size;
            Flynn.mcp.input.addTouchRegion("thrust",
                x, y, x+button_size, y+button_size,
                'round',
                [Game.States.GAME]  // visible_states
                );

            Flynn.mcp.input.addTouchRegion("UI_enter",
                0, 0, Game.CANVAS_WIDTH, Game.CANVAS_HEIGHT, // Whole screen
                'rect',
                []  // visible_states (none)
                );
        }

        // Set resize handler and force a resize
        Flynn.mcp.setResizeFunc( function(width, height){
            // Do nothing
        });
        Flynn.mcp.resize();
    },

    resetScores: function(){
        Game.config.leaderboard.restoreDefaults();
    },

    run: function() {
        // Start the game
        Flynn.mcp.run();
    }
});

}()); // "use strict" wrapper