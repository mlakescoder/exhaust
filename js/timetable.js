//---------------------
// Invasion timetable
//---------------------
var Game = Game || {}; // Create namespace

(function () { "use strict";

Game.WaveEntry = Class.extend({

    init: function(seconds, saucers, kamikazes, fuelers, repeat){
        this.seconds = seconds;
        this.saucers = saucers;
        this.kamikazes = kamikazes;
        this.fuelers = fuelers;
        this.repeat = repeat;
    },

    clone: function(){
        return new Game.WaveEntry(
            this.seconds,
            this.saucers,
            this.kamikazes,
            this.fuelers,
            this.repeat);
    },
});

Game.timetable = [

    // Level 0
    [
        //                 SEC SCR  KAM   FUEL,  RPT
        new Game.WaveEntry(  0,  4,   4,     1,  null),
        new Game.WaveEntry( 60,  5,   4,     0,  null),
        new Game.WaveEntry(120,  5,   4,     0,  null),
        new Game.WaveEntry(180,  6,   4,     1,  null),
        new Game.WaveEntry(240,  8,   6,     1,    60),
    ],

    // Level 1
    [
        //                  SEC SCR  KAM  FUEL,  RPT
        new Game.WaveEntry(  0,  5,   4,     1,  null),
        new Game.WaveEntry( 50,  6,   5,     1,  null),
        new Game.WaveEntry(100,  6,   5,     1,  null),
        new Game.WaveEntry(150,  7,   5,     1,  null),
        new Game.WaveEntry(230,  9,   7,     2,    60),
    ],

    // Level 2
    [
        //                  SEC SCR  KAM  FUEL,  RPT
        new Game.WaveEntry(  0,  8,   4,     1,  null),
        new Game.WaveEntry( 45,  8,   5,     1,  null),
        new Game.WaveEntry( 90,  8,   5,     2,  null),
        new Game.WaveEntry(135,  8,   5,     2,  null),
        new Game.WaveEntry(170, 10,   8,     3,    60),
    ]
];

Game.SpawnManager = Class.extend({

    init: function(level){
        this.spawn_pool = {
            saucers: 0,
            kamikazes: 0,
            fuelers: 0,
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

    update: function(paceFactor, currentObjects){
        this.levelSecondsElapsed += paceFactor/60;

        if(this.repeatTimerSeconds>0){
            this.repeatTimerSeconds -= paceFactor/60;
            if(this.repeatTimerSeconds <= 0){
                console.log("DEV: Spawning repeat wave at " + Math.floor(this.levelSecondsElapsed) );
                // Reload repeat timer
                this.repeatTimerSeconds = this.spawn_queue[0].repeat;
                // Reload spawn pool
                this.loadSpawnPool(this.spawn_queue[0], currentObjects);
            }
        }
        else{
            if(this.levelSecondsElapsed >= this.spawn_queue[0].seconds){
                // Load spawn pool with the next wave
                console.log('DEV: Spawning level ' + this.level + ' wave at ' + Math.floor(this.levelSecondsElapsed) );
                this.loadSpawnPool(this.spawn_queue[0], currentObjects);
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

    loadSpawnPool: function(waveEntry, currentObjects){
        console.log("start load spawn pool. s:" + this.spawn_pool.saucers + " k:" + this.spawn_pool.kamikazes + " f:" + this.spawn_pool.fuelers);
        this.spawn_pool.saucers   = waveEntry.saucers - currentObjects.s;
        this.spawn_pool.kamikazes = waveEntry.kamikazes - currentObjects.k;
        this.spawn_pool.fuelers   = waveEntry.fuelers - currentObjects.f;
        console.log("end load spawn pool. s:" + this.spawn_pool.saucers + " k:" + this.spawn_pool.kamikazes + " f:" + this.spawn_pool.fuelers);
    }
});

}()); // "use strict" wrapper