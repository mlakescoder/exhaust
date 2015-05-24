var FlynnOptionType = {
	BOOLEAN: 0,
	MULTI: 1,
	COMMAND: 2,
	INPUT_KEY: 3,
};

var FlynnOptionDescriptor = Class.extend({

	init: function(keyName, type, defaultValue, currentValue, promptTitle, promptValues, commandHandler){
		this.keyName = keyName;
		this.type = type;
		this.defaultValue = defaultValue;
		this.currentValue = currentValue;
		this.promptTitle = promptTitle;
		this.promptValues = promptValues;
		this.commandHandler = commandHandler;

	},
});

// These current value for all shadowed options will be maintained in mcp.options.<keyName> for convenience
var FlynnShadowedOptionTypes = [FlynnOptionType.MULTI, FlynnOptionType.BOOLEAN];

var FlynnOptionManager = Class.extend({

	init: function(mcp){
		this.mcp = mcp;
		this.optionDescriptors = {};
	},

	addOption: function(keyName, type, defaultValue, currentValue, promptTitle, promptValues, commandHandler){
		var descriptor = new FlynnOptionDescriptor(keyName, type, defaultValue, currentValue, promptTitle, promptValues, commandHandler);
		if (type in FlynnShadowedOptionTypes){
			this.mcp.options[keyName] = currentValue;
		}
		this.optionDescriptors[keyName] = descriptor;
	},

	addOptionFromVirtualButton: function(virtualButtonName){
		var keyCode = this.mcp.input.getVirtualButtonBoundKeyCode(virtualButtonName);
		var keyName = virtualButtonName;
		var descriptor = new FlynnOptionDescriptor(keyName, FlynnOptionType.INPUT_KEY, keyCode, keyCode, keyName, null, null);
		this.optionDescriptors[keyName] = descriptor;
	},

	setOption: function(keyName, value){
		if(keyName in this.optionDescriptors){
			this.optionDescriptors[keyName].currentValue = value;
			if(optionDescriptors[keyName].type in FlynnShadowedOptionTypes){
				this.mcp.options[keyName] = value;
			}
		}
		else{
			console.print('DEV: Warnining: FlynnOptionManager.setOption() called for key "' +
				keyName + '", which does not match an existing option.  Doing nothing.');
		}
	},

	getOption: function(keyName, value){
		if(keyName in this.optionDescriptors){
			return(this.optionDescriptors[keyName].currentValue);
		}
		else{
			console.print('DEV: Warnining: FlynnOptionManager.getOption() called for key "' +
				keyName + '", which does not match an existing option.  Returning null.');
			return null;
		}
	},

	revertToDefaults: function(){
		for (var descriptor in this.optionDescriptors){
			descriptor.currentValue = descriptor.defaultValue;
			if(descriptor.type in FlynnShadowedOptionTypes){
				this.mcp.options[descriptor.keyName] = descriptor.defaultValue;
			}
		}
	},

	executeCommand: function(keyName){
		if(keyName in this.optionDescriptors && this.optionDescriptors[keyName].type === FlynnOptionType.COMMAND){
			this.optionDescriptors[keyName].commandHandler();
		}
		else{
			console.print('DEV: Warnining: FlynnOptionManager.executeCommand() called for key "' +
				keyName + '", which does not exist or is not of type COMMAND.  Doing nothing.');
		}
	}


});