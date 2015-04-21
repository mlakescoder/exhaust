var GameCanvasHeight = 1024;
var GameCanvasWidth = 768;

var States = {
	NO_CHANGE: 0,
	MENU: 1,
	GAME: 2,
	END: 3
};

var Game = Class.extend({
	
	init: function() {
		"use strict";

		var self = this;

		this.input = new FlynnInputHandler({
			//left:		37,
			//up:       38,
			//right:	39,
			//down:		40,
			spacebar:	32,
			enter:		13,
			//a:		65,
			//s:        83,
			//d:        68,
            //q:        81,
			//w:        87,
			x:          88,
			z:          90,
			one:        49,  // ARCADE    Mode: Start
			//two:      50,
			//three:    51,
			//four:     52,
			five:       53,  // ARCADE    Mode: Quarters
            six:        54,  // DEVELOPER Mode: Toggle metrics display
            seven:      55,  // DEVELOPER Mode: Toggle slow motion
            eight:      56,  // DEVELOPER Mode: Add points
            nine:       57,  // DEVELOPER Mode: Die
            zero:       48,  // DEVELOPER Mode: Jump to rescue pad
            dash:       189, // DEVELOPER Mode: Jump to base pad
		});

        // Detect developer mode from URL arguments ("?develop=true")
        var developerModeEnabled = false;
        if(flynnGetUrlValue("develop")=='true'){
            developerModeEnabled = true;
        }

		this.mcp = new FlynnMcp(GameCanvasHeight, GameCanvasWidth, this.input, States.NO_CHANGE, developerModeEnabled);
		this.mcp.setStateBuilderFunc(
			function(state){
				switch(state){
					case States.MENU:
						return new MenuState(self.mcp);
					case States.GAME:
						return new GameState(self.mcp);
					case States.END:
						return new EndState(self.mcp);
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
			self.input.addTouchRegion("touchLeft",0,0,width/4,height); // Left quarter
			self.input.addTouchRegion("touchRight",width/4+1,0,width/2,height); // Left second quarter
			self.input.addTouchRegion("touchThrust",width/2+1,0,width,height); // Right half
		});
		this.mcp.resize();
	},

	run: function() {
		// Start the game
		this.mcp.run();
	}
});