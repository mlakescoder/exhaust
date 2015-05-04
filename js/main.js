var GameCanvasHeight = 1024;
var GameCanvasWidth = 768;

var States = {
	NO_CHANGE: 0,
	MENU:      1,
	CONFIG:    2,
	GAME:      3,
	END:       4
};

var Game = Class.extend({
	
	init: function() {
		"use strict";

		var self = this;

        // Detect developer mode from URL arguments ("?develop=true")
        var developerModeEnabled = false;
        if(flynnGetUrlValue("develop")=='true'){
            developerModeEnabled = true;
        }
        
        this.input = new FlynnInputHandler();

		this.mcp = new FlynnMcp(GameCanvasHeight, GameCanvasWidth, this.input, States.NO_CHANGE, developerModeEnabled);
		this.mcp.setStateBuilderFunc(
			function(state){
				switch(state){
					case States.MENU:
						return new StateMenu(self.mcp);
					case States.GAME:
						return new StateGame(self.mcp);
					case States.END:
						return new StateEnd(self.mcp);
					case States.CONFIG:
						return new StateConfig(self.mcp);
				}
			}
		);
		this.mcp.nextState = States.MENU;

        // Detect arcade mode from URL arguments ("?arcade=true")
        this.mcp.credits=0;
        if(flynnGetUrlValue("arcade")=='true'){
            this.mcp.arcadeModeEnabled = true;
        }
        else{
            this.mcp.arcadeModeEnabled = false;
        }

        
        // Setup inputs
		this.input.addVirtualButton('thrust', FlynnKeyboardMap['spacebar'], FlynnConfigurable);
		this.input.addVirtualButton('enter', FlynnKeyboardMap['enter'], FlynnNotConfigurable);
		this.input.addVirtualButton('rotate left', FlynnKeyboardMap['z'], FlynnConfigurable);
		this.input.addVirtualButton('rotate right', FlynnKeyboardMap['x'], FlynnConfigurable);
		this.input.addVirtualButton('config', FlynnKeyboardMap['escape'], FlynnNotConfigurable);
		this.input.addVirtualButton('up', FlynnKeyboardMap['up'], FlynnNotConfigurable);
		this.input.addVirtualButton('down', FlynnKeyboardMap['down'], FlynnNotConfigurable);
		if(developerModeEnabled){
			this.input.addVirtualButton('dev_metrics', FlynnKeyboardMap['6'], FlynnNotConfigurable);
			this.input.addVirtualButton('dev_slow_mo', FlynnKeyboardMap['7'], FlynnNotConfigurable);
			this.input.addVirtualButton('dev_add_points', FlynnKeyboardMap['8'], FlynnNotConfigurable);
			this.input.addVirtualButton('dev_die', FlynnKeyboardMap['9'], FlynnNotConfigurable);
			this.input.addVirtualButton('dev_rescue', FlynnKeyboardMap['0'], FlynnNotConfigurable);
			this.input.addVirtualButton('dev_base', FlynnKeyboardMap['-'], FlynnNotConfigurable);
		}
		if(this.mcp.arcadeModeEnabled){
			this.input.addVirtualButton('quarter', FlynnKeyboardMap['5'], FlynnConfigurable);
			this.input.addVirtualButton('start_1', FlynnKeyboardMap['1'], FlynnConfigurable);
		}

		// Scores
		this.mcp.highscores = [
			["FIENDFODDER", 2000],
			["FLOATINHEAD", 1300],
			["WILLIAMS", 1200],
			["GORLIN", 1100],
			["INKY", 600],
			["LUDAM", 500],
		];
		this.mcp.custom.score = 0;

		
		// Set resize handler and force a resize
		this.mcp.setResizeFunc( function(width, height){
			self.input.addTouchRegion("left",0,0,width/4,height); // Left quarter
			self.input.addTouchRegion("right",width/4+1,0,width/2,height); // Left second quarter
			self.input.addTouchRegion("thrust",width/2+1,0,width,height); // Right half
			self.input.addTouchRegion("enter",0,0,width,height); // Whole screen
		});
		this.mcp.resize();
	},

	run: function() {
		// Start the game
		this.mcp.run();
	}
});