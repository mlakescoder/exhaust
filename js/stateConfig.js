//--------------------------------------------
// StateConfig class
//    Allow user to configure game options
//--------------------------------------------

var OptionSelectionMargin = 5;
var OptionSelectionMarginInset = 2;
var OptionTextScale = 2.0;
var OptionTextHeight = FlynnCharacterHeight * OptionTextScale;
var OptionFuncitonWidth = 190;
var OptionCenterGapWidth = FlynnCharacterWidth * 2 * OptionTextScale;
var OptionKeyPrompt = "PRESS NEW KEY";
var OptionInputKeyValueWidth = OptionTextScale * FlynnCharacterSpacing * OptionKeyPrompt.length+1 + OptionSelectionMargin * 2;
var OptionMainTextColor = FlynnColors.ORANGE;
var OptionMenuTextColor = FlynnColors.YELLOW;
var OptionSelectionBoxColor = FlynnColors.CYAN;
var OptionMenuPromptColor = FlynnColors.MAGENTA;

var StateConfig = FlynnState.extend({

	init: function(mcp){
		this._super(mcp);

		this.canvasWidth = mcp.canvas.ctx.width;
		this.canvasHeight = mcp.canvas.ctx.height;

		this.configurableVirtualButtonNames = this.mcp.input.getConfigurableVirtualButtonNames();

		this.keyAssignmentInProgress = false;

		this.optionKeyNames = mcp.optionManager.getOptionKeyNames();
		this.numOptions = this.optionKeyNames.length;
		this.selectedLineIndex = 0;
	},

	handleInputs: function(input, paceFactor) {
		var optionKeyName = this.optionKeyNames[this.selectedLineIndex];

		if(this.keyAssignmentInProgress){
			var capturedKeyCode = input.getCapturedKeyCode();
			if (capturedKeyCode){
				if(!input.isKeyCodeAssigned(capturedKeyCode)){
					// The chosen keyCode is available.  Assign it.
					this.mcp.optionManager.setOption(optionKeyName, capturedKeyCode);
					this.keyAssignmentInProgress = false;
				} else{
					currentlyAssignedKeyCode = this.mcp.optionManager.getOption(optionKeyName);
					if (currentlyAssignedKeyCode === capturedKeyCode){
						// User pressed the key which was already assigned.  Do nothing.
						this.keyAssignmentInProgress = false;
					} else{
						// The chosen keyCode is not availble. Keep waiting for a valid key.
						input.armKeyCodeCapture();
						// TODO: Prompt user that key is in use.
						console.log("that key is in use");
					}
				}
			}

			if (input.virtualButtonIsPressed("config")) {
				this.keyAssignmentInProgress = false;
			}
			return;
		}
		
		var optionDescriptor = this.mcp.optionManager.optionDescriptors[this.optionKeyNames[this.selectedLineIndex]];

        if(this.mcp.arcadeModeEnabled) {
            if (input.virtualButtonIsPressed("quarter")) {
                this.mcp.credits += 1;
                this.insert_coin_sound.play();
            }
        }
		if (input.virtualButtonIsPressed("config")) {
			this.mcp.nextState = States.MENU;
		}
		if (input.virtualButtonIsPressed("down")) {
			++this.selectedLineIndex;
			if(this.selectedLineIndex >= this.numOptions){
				this.selectedLineIndex = 0;
			}
		}
		if (input.virtualButtonIsPressed("up")) {
			--this.selectedLineIndex;
			if(this.selectedLineIndex < 0){
				this.selectedLineIndex = this.numOptions-1;
			}
		}
		if (input.virtualButtonIsPressed("enter")) {
			switch(optionDescriptor.type){
				case FlynnOptionType.BOOLEAN:
					// Toggle boolean
					this.mcp.optionManager.setOption(optionDescriptor.keyName, !optionDescriptor.currentValue);
					break;

				case FlynnOptionType.INPUT_KEY:
					input.armKeyCodeCapture();
					this.keyAssignmentInProgress = true;
					break;

				case FlynnOptionType.COMMAND:
					commandHandler = optionDescriptor.commandHandler;
					if (commandHandler !== null){
						commandHandler();
					}
					break;
			}
		}
		var optionIndexDelta = 0;
		if (input.virtualButtonIsPressed("left")) {
			optionIndexDelta = -1;
		}
		if (input.virtualButtonIsPressed("right")) {
			optionIndexDelta = 1;
		}
		if(optionIndexDelta !== 0){
			if(optionDescriptor.type === FlynnOptionType.MULTI){
				var currentPromptIndex = optionDescriptor.currentPromptValueIndex();
				var numOptions = optionDescriptor.promptValues.length;
				currentPromptIndex += optionIndexDelta;
				if(currentPromptIndex < 0){
					currentPromptIndex = numOptions-1;
				} else if (currentPromptIndex > numOptions-1){
					currentPromptIndex = 0;
				}
				this.mcp.optionManager.setOption(optionDescriptor.keyName, optionDescriptor.promptValues[currentPromptIndex][1]);
			}
		}

	},

	update: function(paceFactor) {

	},

	render: function(ctx) {
        ctx.clearAll();

        ctx.vectorText("CONFIGURATION OPTIONS", 4, null, 100, null, OptionMainTextColor);

        var line_spacing = 15;
        var line_y = 160;
        ctx.vectorText("PRESS <UP>/<DOWN> TO SELECT A CONTROL", 1.5, null, line_y, null, OptionMainTextColor);
        line_y += line_spacing;
        ctx.vectorText("PRESS <ENTER> TO EDIT THE SELECTED CONTROL", 1.5, null, line_y, null, OptionMainTextColor);
        line_y += line_spacing;
        ctx.vectorText("PRESS <ESCAPE> TO EXIT/CANCEL", 1.5, null, line_y, null, OptionMainTextColor);

        var names = this.configurableVirtualButtonNames;
        
        var menu_top_y = 250;
        var menu_center_x = this.canvasWidth/2;
        var menu_line_height = 30;

        var lineSelectionBox = {x:0, y:0, width:0, height:0};
        var selectionBox = null;
        var textWidth;
        for (var i=0, len=this.optionKeyNames.length; i<len; i++){
			var optionKeyName = this.optionKeyNames[i];
			var optionDescriptor = this.mcp.optionManager.optionDescriptors[optionKeyName];

			// Render option prompt text
			switch(optionDescriptor.type){
				case FlynnOptionType.COMMAND:
					ctx.vectorText(
						optionDescriptor.promptText,
						2, null,
						menu_top_y + menu_line_height * i,
						null, OptionMenuTextColor);

					textWidth = (optionDescriptor.promptText.length * FlynnCharacterSpacing - FlynnCharacterGap) * OptionTextScale;
					lineSelectionBox = {
						x: this.canvasWidth/2 - textWidth/2 - OptionSelectionMargin,
						y: menu_top_y + menu_line_height * i - OptionSelectionMargin,
						width: textWidth + OptionSelectionMargin * 2,
						height: FlynnCharacterHeight * OptionTextScale + OptionSelectionMargin * 2};

					break;
				default:
					ctx.vectorText(
						optionDescriptor.promptText + ':',
						2, menu_center_x - OptionCenterGapWidth/2,
						menu_top_y + menu_line_height * i,
						0, OptionMenuTextColor);
					break;
			}

			// Render option value(s)
			var valueText = '';
			var valueColor = OptionMenuTextColor;
			switch(optionDescriptor.type){
				case FlynnOptionType.BOOLEAN:
					if (optionDescriptor.currentValue === true){
						valueText = "ON";
					}
					else{
						valueText = "OFF";
					}

					textWidth = (3 * FlynnCharacterSpacing - FlynnCharacterGap) * OptionTextScale;
					lineSelectionBox = {
						x: menu_center_x + OptionCenterGapWidth/2 - OptionSelectionMargin,
						y: menu_top_y + menu_line_height * i - OptionSelectionMargin,
						width: textWidth + OptionSelectionMargin * 2,
						height: FlynnCharacterHeight * OptionTextScale + OptionSelectionMargin * 2};
					break;

				case FlynnOptionType.MULTI:
					var j, len2;
					for (j=0, len2=optionDescriptor.promptValues.length; j<len2; j++){
						valueText += optionDescriptor.promptValues[j][0] + '  ';
					}
					var characterSkip = 0;
					var currentPromptValueIndex = optionDescriptor.currentPromptValueIndex();
					for (j=0, len2=optionDescriptor.promptValues.length; j<len2; j++){
						if(j < currentPromptValueIndex){
							characterSkip += optionDescriptor.promptValues[j][0].length + 2;
						}
					}
					textWidth = (optionDescriptor.promptValues[currentPromptValueIndex][0].length * FlynnCharacterSpacing - FlynnCharacterGap) * OptionTextScale;
					lineSelectionBox = {
						x: menu_center_x + OptionCenterGapWidth/2 - OptionSelectionMargin + (characterSkip * FlynnCharacterSpacing * OptionTextScale) ,
						y: menu_top_y + menu_line_height * i - OptionSelectionMargin,
						width: textWidth + OptionSelectionMargin * 2,
						height: FlynnCharacterHeight * OptionTextScale + OptionSelectionMargin * 2};

					ctx.vectorRect(
						lineSelectionBox.x+OptionSelectionMarginInset,
						lineSelectionBox.y+OptionSelectionMarginInset,
						lineSelectionBox.width-OptionSelectionMarginInset*2,
						lineSelectionBox.height-OptionSelectionMarginInset*2,
						valueColor);
					break;

				case FlynnOptionType.INPUT_KEY:
					var keyCode = optionDescriptor.currentValue;
					if(this.keyAssignmentInProgress && i===this.selectedLineIndex){
						valueText = "PRESS NEW KEY";
						valueColor = OptionMenuPromptColor;
					}
					else{
						valueText = this.mcp.input.keyCodeToKeyName(keyCode);
					}
					lineSelectionBox = {
						x: menu_center_x + OptionCenterGapWidth/2 - OptionSelectionMargin,
						y: menu_top_y + menu_line_height * i - OptionSelectionMargin,
						width: OptionInputKeyValueWidth,
						height: FlynnCharacterHeight * OptionTextScale + OptionSelectionMargin * 2};
					break;

			}
			ctx.vectorText(
				valueText,
				2, menu_center_x + OptionCenterGapWidth/2,
				menu_top_y + menu_line_height * i,
				null, valueColor);
			if(i === this.selectedLineIndex){
				selectionBox = lineSelectionBox;
			}
        }

        // Draw box around currently selected option
        if(selectionBox !== null){
			ctx.vectorRect(
				selectionBox.x,
				selectionBox.y,
				selectionBox.width,
				selectionBox.height,
				OptionSelectionBoxColor);
		}
	}

});