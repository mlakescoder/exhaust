//---------------------
// Invasion timetable
//---------------------
if (typeof Game == "undefined") {
   var Game = {};  // Create namespace
}

Game.WaveEntry = Class.extend({

    init: function(seconds, saucers, kamikazes, repeat){
        this.seconds = seconds;
        this.saucers = saucers;
        this.kamikazes = kamikazes;
        this.repeat = repeat;
    },

    clone: function(){
        return new Game.WaveEntry(
            this.seconds,
            this.saucers,
            this.kamikazes,
            this.repeat);
    },
});

Game.timetable = [

    // Level 0
    [
        //            SEC SCR  KAM    RPT 
        new Game.WaveEntry(  0,  5,   3,  null),
        new Game.WaveEntry( 50,  6,   4,  null),
        new Game.WaveEntry(100,  6,   4,  null),
        new Game.WaveEntry(150,  6,   4,  null),
        new Game.WaveEntry(200, 15,  10,    60),
    ],

    // Level 1
    [
        //            SEC SCR  KAM    RPT 
        new Game.WaveEntry(  0,  8,   6,  null),
        new Game.WaveEntry( 30,  8,   6,  null),
        new Game.WaveEntry( 60,  8,   6,  null),
        new Game.WaveEntry(120,  8,   6,  null),
        new Game.WaveEntry(150, 15,  10,    60),
    ]
];

Game.SpawnManager = Class.extend({

    init: function(level){
        this.spawn_pool = {
            saucers: 0,
            kamikazes: 0,
        };
        this.levelSecondsElapsed = 0.0;
        this.level = level;
        this.repeatTimerSeconds = 0;

        var timetable_index = level;
        if (timetable_index >= Game.timetable.length){
            timetable_index = Game.timetable.length - 1;
        }
        this.spawn_queue = [];
        for(var i=0, len=Game.timetable[timetable_index].length; i<len; i++){
            this.spawn_queue.push(Game.timetable[timetable_index][i].clone());
        }
    },

    update: function(paceFactor){
        this.levelSecondsElapsed += paceFactor/60;

        if(this.repeatTimerSeconds>0){
            this.repeatTimerSeconds -= paceFactor/60;
            if(this.repeatTimerSeconds <= 0){
                console.log("DEV: Spawning repeat wave at " + Math.floor(this.levelSecondsElapsed) );
                // Reload repeat timer
                this.repeatTimerSeconds = this.spawn_queue[0].repeat;
                // Reload spawn pool
                this.loadSpawnPool(this.spawn_queue[0]);
            }
        }
        else{
            if(this.levelSecondsElapsed >= this.spawn_queue[0].seconds){
                // Load spawn pool with the next wave
                console.log('DEV: Spawning level ' + this.level + ' wave at ' + Math.floor(this.levelSecondsElapsed) );
                this.loadSpawnPool(this.spawn_queue[0]);
                if(this.spawn_queue[0].repeat){
                    // Last wave entry reached.  Repeat it.
                    this.repeatTimerSeconds = this.spawn_queue[0].repeat;
                } else{
                    // Remove this wave from the queue.
                    this.spawn_queue.splice(0,1);
                }
            }
        }
    },

    loadSpawnPool: function(waveEntry){
        this.spawn_pool.saucers += waveEntry.saucers;
        this.spawn_pool.kamikazes += waveEntry.kamikazes;
    }
});