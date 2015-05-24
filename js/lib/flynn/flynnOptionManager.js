var FlynnOptionType = {
	BOOLEAN: 0,
	MULTI: 1,
	COMMAND: 2,
};

var FlynnOptionDescriptor = Class.extend({

	init: function(keyName, type, defaultValue, promptTitle, promptValues, commandHandler){
		this.keyName = keyName;
		this.type = type;
		this.defaultValue = defaultValue;
		this.promptTitle = promptTitle;
		this.promptValues = promptValues;
		this.commandHandler = commandHandler;

	},
});

var FlynnOptionManager = Class.extend({

	init: function(options){
		this.options = options;
		this.optionDescriptors = {};
	},

	addOption: function(keyName, type, defaultValue, currentValue, promptTitle, promptValues, commandHandler){
		var descriptor = new FlynnOptionDescriptor(keyName, type, defaultValue, promptTitle, promptValues, commandHandler);
		if (type != FlynnOptionType.COMMAND){
			this.options[keyName] = currentValue;
		}
		this.optionDescriptors[keyName] = descriptor;
	},

	setOption: function(keyName, value){
		if(keyName in this.optionDescriptors){
			this.options[keyName] = value;
		}
		else{
			console.print('DEV: Warnining: FlynnOptionManager.setOption() called for key "' +
				keyName + '", which does not match an existing option.  Doing nothing.');
		}
	},

	getOption: function(keyName, value){
		if(keyName in this.optionDescriptors){
			return(this.options[keyName]);
		}
		else{
			console.print('DEV: Warnining: FlynnOptionManager.getOption() called for key "' +
				keyName + '", which does not match an existing option.  Returning null.');
			return null;
		}
	},

	revertToDefaults: function(){
		for (var descriptor in this.optionDescriptors){
			if(descriptor.type != FlynnOptionType.COMMAND){
				this.options[descriptor.keyName] = descriptor.defaultValue;
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