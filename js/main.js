var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.VERSION = '1.21.0';
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

        var self = this;

        Flynn.init(
            Game.CANVAS_WIDTH,
            Game.CANVAS_HEIGHT, 
            Game.States.NO_CHANGE,
            Game.SPEED_FACTOR,
            function(state){
                switch(state){
                    case Game.States.MENU:
                        Game.state_game = null;
                        return new Game.StateMenu();
                    case Game.States.GAME:
                        if(Game.state_game){
                            // Game in progress
                            return Game.state_game;
                        }
                        // Start new game
                        Game.state_game = new Game.StateGame();
                        return Game.state_game;
                    case Game.States.END:
                        Game.state_game = null;
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
                            Game.state_game ? Game.States.GAME : Game.States.MENU,  // Parent state
                            Game.States.MENU,         // Abort state
                            Game.state_game !== null  // Abort enable
                            );
                }
            }
        );
        Flynn.mcp.changeState(Game.States.MENU);

        Game.config = {};
        Game.config.score = 0;
        Game.config.fuel = 0;

        this.fuelRemaining = 0;

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
            input.addVirtualButton('pause',          Flynn.KeyboardMap.p,         Flynn.BUTTON_CONFIGURABLE);
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

        //----------------------
        // Sounds
        //----------------------
        Game.sounds = {
            music:{ 
                background: new Howl({
                    src: ['sounds/DST-Expander.mp3'],
                    loop: true,
                    buffer: !this.browserIsIos,  // Buffering causes problems on iOS devices
                    volume: 0.5 }),
            },

            // Interface
            start: new Howl({
                src: ['sounds/Tripple_blip.ogg','sounds/Tripple_blip.mp3'],
                volume: 0.5 }),
            insert_coin: new Howl({
                src: ['sounds/InsertCoin.ogg','sounds/InsertCoin.mp3'],
                volume: 0.5 }),

            // Primary
            engine: new Howl({
                src: ['sounds/Engine.ogg','sounds/Engine.mp3'],
                volume: 0.25,
                loop: true,}),
            player_die: new Howl({
                src: ['sounds/Playerexplosion2.ogg','sounds/Playerexplosion2.mp3'],
                volume: 0.25 }),
            extra_life: new Howl({
                src: ['sounds/ExtraLife.ogg','sounds/ExtraLife.mp3'],
                volume: 1.00 }),
            ship_respawn: new Howl({
                src: ['sounds/ShipRespawn.ogg','sounds/ShipRespawn.mp3'],
                volume: 0.25 }),
            saucer_die: new Howl({
                src: ['sounds/Drifterexplosion.ogg','sounds/Drifterexplosion.mp3'],
                volume: 0.25 }),
            saucer_shoot: new Howl({
                src: ['sounds/SaucerShoot.ogg','sounds/SaucerShoot.mp3'],
                volume: 0.25 }),
            laser_pod: new Howl({
                src: ['sounds/LaserPod4.ogg','sounds/LaserPod4.mp3'],
                volume: 0.5 }),
            level_advance: new Howl({
                src: ['sounds/LevelAdvance2.ogg','sounds/LevelAdvance2.mp3'],
                volume: 0.5 }),
            bonus: new Howl({
                src: ['sounds/Bonus.ogg','sounds/Bonus.mp3'],
                volume: 0.5 }),
        };
        Game.updateMusic = function(){
            var enabled = (
                Flynn.mcp.optionManager.getOption('musicEnabled') &&
                Flynn.mcp.optionManager.getOption('soundEnabled')
                );
            if(enabled){
                if(!Game.sounds.music.background.playing()){
                    Game.sounds.music.background.play();
                }
            }
            else{
                Game.sounds.music.background.stop();
            }
        };
        Game.updateSound = function(){
            var sound_enabled = Flynn.mcp.optionManager.getOption('soundEnabled');
            Flynn.mcp.muteAudio(!sound_enabled);
            Game.updateMusic();
        };
        Game.updateSoundOptionChange = function(){
            Game.updateSound();
            var sound;
            var sound_enabled = Flynn.mcp.optionManager.getOption('soundEnabled');
            if (sound_enabled){
                Flynn.sounds.ui_select.play();
            }
        };

        // Options
        Flynn.mcp.optionManager.addOptionFromVirtualButton('rotate left');
        Flynn.mcp.optionManager.addOptionFromVirtualButton('rotate right');
        Flynn.mcp.optionManager.addOptionFromVirtualButton('thrust');
        Flynn.mcp.optionManager.addOptionFromVirtualButton('pause');

        Flynn.mcp.optionManager.addOption('soundEnabled', Flynn.OptionType.BOOLEAN, true, true, 'SOUND', null,
            Game.updateSoundOptionChange // Callback on option change
            );
        Flynn.mcp.optionManager.addOption('musicEnabled', Flynn.OptionType.BOOLEAN, true, true, 'MUSIC', null,
            Game.updateMusic // Callback on option change
            );
        Flynn.mcp.optionManager.addOption('resetScores', Flynn.OptionType.COMMAND, true, true, 'RESET HIGH SCORES', null,
            function(){self.resetScores();});

        // Restore user option settings from cookies
        Flynn.mcp.optionManager.loadFromCookies();
        
        // Setup touch controls
        var button_size   = 200;
        var button_margin = 1;
        var button_gap = 20;
        var joystick_radius = 100;
        var x, y;
        if(Flynn.mcp.browserSupportsTouch){
            // Flynn.mcp.input.addVirtualJoystick({
            //     radius: joystick_radius,
            //     pos: {
            //         x: joystick_radius + button_margin, 
            //         y: Game.CANVAS_HEIGHT - joystick_radius - button_margin
            //     },
            //     name: 'stick',
            //     button_map: {
            //         left:  'rotate left',
            //         right: 'rotate right'
            //     },
            //     visible_states: [Game.States.GAME],
            // });
            x = button_margin;
            y = Game.CANVAS_HEIGHT - button_size - button_margin;
            Flynn.mcp.input.addTouchRegion("rotate left",
                x, y, x+button_size, y+button_size,
                'round',
                [Game.States.GAME]  // visible_states
                );

            x += button_size + button_gap;
            Flynn.mcp.input.addTouchRegion("rotate right",
                x, y, x+button_size, y+button_size,
                'round',
                [Game.States.GAME]  // visible_states
                );

            x = Game.CANVAS_WIDTH  - button_size - button_margin;
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

        // Initialize sound and music
        Game.updateSound();
        Game.updateMusic();
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
