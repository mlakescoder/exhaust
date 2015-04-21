//------------
// Colors 
//------------
var FlynnColors = {
	BLACK:      "#000000",
	BLUE:		"#2020FF",
	WHITE:		"#FFFFFF",
	GREEN:      "#00FF00",
	YELLOW:     "#FFFF00",
	RED:        "#FF0000",
	CYAN:       "#00FFFF",
	MAGENTA:	"#FF00FF",
	CYAN_DK:    "#008080",
	
	ORANGE:     "#E55300",
	BROWN:      "#8B4513",
	YELLOW_DK:  "#808000",
};

//------------
// Font 
//------------
var FlynnUnimplementedChar = [0,6,0,0,4,0,4,6,0,6,4,0,4,6,0,0,0,6];
var FlynnPenUp = 9999;
var FlynnPoints = {
	UNIMPLEMENTED_CHAR: FlynnUnimplementedChar,
	PEN_UP: FlynnPenUp,
	
	ASCII: [
		[1,0,2,5,1.5,5,1.5,6,2.5,6,2.5,5,2,5,3,0,1,0],     // !
		[1,0,1,1,FlynnPenUp,FlynnPenUp,3,0,3,1],           // "
		[1,5,1,1,1,2,0,2,4,2,3,2,3,1,3,5,3,                // #
			4,4,4,0,4,1,4,1,5],
		[0,6,3,6,4,5,4,4,3,3,1,3,0,2,0,1,1,0,4,0,2,0,2,6], // $        
		[0,6,4,0,2,3,2,1,0,1,0,3,4,3,4,5,2,5,2,3,0,6],     // %  
		[4,6,1,2,1,1,2,0,3,1,3,2,0,4,0,5,1,6,2,6,4,4],     // &  
		[2,0,2,1,2,0],                                     // '  
		[4,6,3,6,2,5,2,1,3,0,4,0],                         // (  
		[1,0,2,0,3,1,3,5,2,6,1,6],                         // )  
		[0,1,2,3,2,1,2,3,4,1,2,3,4,3,2,3,4,5,2,3,          // *
			2,5,2,3,0,5,2,3,0,3],
		[2,5,2,1,2,3,0,3,4,3,2,3,2,5],                     // +  
		[2,5,1,6,2,5],                                     // ,  
		[1,3,3,3],                                         // -  
		[1.5,6,1.5,5,2.5,5,2.5,6,1.5,6],                   // .  
		[1,6,3,0,1,6],                                     // /  
		[0,0,0,6,4,6,4,0,0,0],                             // 0
		[2,0,2,6],                                         // 1
		[0,0,4,0,4,3,0,3,0,6,4,6],                         // 2
		[0,0,4,0,4,3,0,3,4,3,4,6,0,6],                     // 3
		[0,0,0,3,4,3,4,0,4,6],                             // 4
		[4,0,0,0,0,3,4,3,4,6,0,6],                         // 5
		[0,0,0,6,4,6,4,3,0,3],                             // 6
		[0,0,4,0,4,6],                                     // 7
		[0,3,4,3,4,6,0,6,0,0,4,0,4,3],                     // 8
		[4,3,0,3,0,0,4,0,4,6],                             // 9
		[2,1,1.5,1.5,2,2,2.5,1.5,2,1,                      // :
			FlynnPenUp, FlynnPenUp,
			2,4,1.5,4.5,2,5,2.5,4.5,2,4],
		[2,1,1.5,1.5,2,2,2.5,1.5,2,1,                      // ;
			FlynnPenUp, FlynnPenUp,
			1.5,4,2.5,4,1.5,6,1.5,4],
		[4,1,0,3,4,5,0,3,4,1],                             // <  
		[0,1.5,4,1.5,FlynnPenUp,FlynnPenUp,0,4.5,4,4.5],   // = 
		[0,1,4,3,0,5,4,3,0,1],                             // >  
		[0,2,0,1,1,0,3,0,4,1,4,2,2,3,2,6,2,3,4,2,4,
			1,3,0,1,0,0,1,0,2],                            // ?  
		[3,4,3,2,1,2,1,4,4,4,4,2,3,1,1,1,0,2,0,4,1,5,3,5], // @
		[0,6,0,2,2,0,4,2,4,4,0,4,4,4,4,6],                 // A
		[0,3,0,6,2,6,3,5,3,4,2,3,0,3,0,0,2,0,3,1,3,2,2,3], // B
		[4,0,0,0,0,6,4,6],                                 // C
		[0,0,0,6,2,6,4,4,4,2,2,0,0,0],                     // D
		[4,0,0,0,0,3,3,3,0,3,0,6,4,6],                     // E
		[4,0,0,0,0,3,3,3,0,3,0,6],                         // F
		[4,2,4,0,0,0,0,6,4,6,4,4,2,4],                     // G
		[0,0,0,6,0,3,4,3,4,0,4,6],                         // H
		[0,0,4,0,2,0,2,6,4,6,0,6],                         // I
		[4,0,4,6,2,6,0,4],                                 // J
		[3,0,0,3,0,0,0,6,0,3,3,6],                         // K
		[0,0,0,6,4,6],                                     // L
		[0,6,0,0,2,2,4,0,4,6],                             // M
		[0,6,0,0,4,6,4,0],                                 // N
		[0,0,4,0,4,6,0,6,0,0],                             // O
		[0,6,0,0,4,0,4,3,0,3],                             // P
		[0,0,0,6,2,6,3,5,4,6,2,4,3,5,4,4,4,0,0,0],         // Q
		[0,6,0,0,4,0,4,3,0,3,1,3,4,6],                     // R
		[4,0,0,0,0,3,4,3,4,6,0,6],                         // S
		[0,0,4,0,2,0,2,6],                                 // T
		[0,0,0,6,4,6,4,0],                                 // U
		[0,0,2,6,4,0],                                     // V
		[0,0,0,6,2,4,4,6,4,0],                             // W
		[0,0,4,6,2,3,4,0,0,6],                             // X
		[0,0,2,2,4,0,2,2,2,6],                             // Y
		[0,0,4,0,0,6,4,6],                                 // Z
		[3,0,1,0,1,6,3,6],                                 // [  
		[1,0,3,6],                                         // /  
		[1,0,3,0,3,6,1,6],                                 // ]  
		[1,1,2,0,3,1],                                     // ^ 
		[0,6,4,6],                                         // _
		[1.5,0,2.5,1],                                     // `
	],
};