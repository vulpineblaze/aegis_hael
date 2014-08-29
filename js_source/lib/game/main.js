
ig.module( 
  'game.main' 
)
.requires(
  'impact.game',
  'impact.font',
  'impact.timer',
  'game.levels.intro',
  //'game.levels.dorm1'
  
  'impact.debug.debug' // <- Add this
)
.defines(function(){

  MyGame = ig.Game.extend({
  
    font: new ig.Font( 'media/04b03.font.png' ),
    outputMsg: 0,
    statText: new ig.Font( 'media/04b03.font.png' ),
    showStats: false,
    statMatte: new ig.Image('media/stat-matte.png'),
    levelTimer: new ig.Timer(),
    levelExit: null,

    stats: { fuel: 0,
              crew: 0,
              hull: 0,
              filler: 0,
              crystal: 0,
              time: 0, 
              kills: 0, 
              deaths: 0,
              deathText:0
              },
    
    lives: 1,
    
    gravity:0,

    highlighted:0,
    lastHL:0,
    lines: [],

    towerList: [],
    towerBuild: 0,

    map: [],
    mapSize: 64,

    showCursor: "0",
    theCursor: [],



    mapAccel:2.1,
    
    init: function() {
    // Initialize your game here; bind keys etc.

 
      this.loadLevel( LevelIntro );

      this.theCursor = ig.game.getEntitiesByType( EntityCursor )[0];

      
      // Bind keys
      ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
      ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
      ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
      ig.input.bind( ig.KEY.UP_ARROW, 'up' );
      ig.input.bind( ig.KEY.A, 'left' );
      ig.input.bind( ig.KEY.D, 'right' );
      ig.input.bind( ig.KEY.S, 'down' );
      ig.input.bind( ig.KEY.W, 'up' );
      ig.input.bind( ig.KEY.X, 'jump' );
      ig.input.bind( ig.KEY.C, 'shoot' );

      ig.input.bind(ig.KEY._0, 'num0');
      ig.input.bind(ig.KEY._1, 'num1');
      ig.input.bind(ig.KEY._2, 'num2');
      ig.input.bind(ig.KEY._3, 'num3');
      ig.input.bind(ig.KEY._4, 'num4');
      ig.input.bind(ig.KEY._5, 'num5');
      ig.input.bind(ig.KEY._6, 'num6');
      ig.input.bind(ig.KEY._7, 'num7');
      ig.input.bind(ig.KEY._8, 'num8');
      ig.input.bind(ig.KEY._9, 'num9');


      
      ig.input.initMouse();
      ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );

      this.buildTowerList();

      this.stats.fuel = LevelStats.fuel;
      this.stats.crew = LevelStats.crew;
      this.stats.hull = LevelStats.hull;
      this.stats.crystal = LevelStats.crystal;


    },
    
    update: function(){
    
        // screen follows the player
      // var player = this.getEntitiesByType( EntityPlayer )[0];
      LevelUpdate();
      
      var player = 0;
      if(ig.game.highlighted == 0 && ig.game.lastHL == 0){
        //this is the very first click
        // var homePlanet = ig.game.getEntitiesByType( EntityPlanet );
        // ig.game.highlighted = homePlanet[0];
        // this.setHomeProfile(ig.game.highlighted);
      }
      // if(ig.game.highlighted != 0){
      //  player = ig.game.highlighted;
      // }
      if(ig.game.highlighted != ig.game.lastHL){
        // this.outputMsg = 0;

        if (this.highlighted != 0 && this.lastHL != 0){
          // this.lines.push(ig.game.spawnEntity( EntityLine ,
          //                         ig.game.highlighted.pos.x,
          //                         ig.game.highlighted.pos.y,
          //                         {target:
          //                           {x:ig.game.lastHL.pos.x,
          //                             y:ig.game.lastHL.pos.y}
          //                           }
          //                           ));
          //first time this has been clicked
        }

        ig.game.lastHL = ig.game.highlighted ;
        player = ig.game.highlighted;
        

      }else{
        player = 0;
      }

      if( player != 0) { //pretty much can only be 0 if game is new
        this.screen.x = player.pos.x - ig.system.width/2;
        this.screen.y = player.pos.y - (.50)*ig.system.height;
        // this.checkForNegativeResources();
      }
      
      if(!(this.instructText == null)){if( (this.instructText == null) || this.instructText && player.accel.x > 0)
      {this.instructText = null;}}

      if( ig.input.state('left') ) {
        this.screen.x += -this.mapAccel;
      }else if( ig.input.state('right') ) {
        this.screen.x += this.mapAccel;
      }else if( ig.input.state('up') ) {
        this.screen.y += -this.mapAccel;
      }else if( ig.input.state('down') ) {
        this.screen.y += this.mapAccel;
      }

      
      for(var i =1;i<10;i++){
        if(ig.input.state('num'+i)){
          // console.log(i)
          this.towerBuild = i; //
        }
      }

      if(this.towerBuild > 0){
        this.checktowerPlacement();
        switch (this.towerBuild) {
          case 1:
            this.theCursor.currentAnim = this.theCursor.anims.first;break;
          case 2:
            this.theCursor.currentAnim = this.theCursor.anims.second;break;
          case 3:
            this.theCursor.currentAnim = this.theCursor.anims.third;break;
          case 4:
            this.theCursor.currentAnim = this.theCursor.anims.fourth;break;
          case 5:
            this.theCursor.currentAnim = this.theCursor.anims.fifth;break;
          case 6:
            this.theCursor.currentAnim = this.theCursor.anims.sixth;break;
          case 7:
            this.theCursor.currentAnim = this.theCursor.anims.seventh;break;
          case 8:
            this.theCursor.currentAnim = this.theCursor.anims.eigth;break;
          case 9:
            this.theCursor.currentAnim = this.theCursor.anims.ninth;break;
          default:
            this.theCursor.currentAnim = this.theCursor.anims.idle;
        }
        
      }else{
        this.theCursor.currentAnim = this.theCursor.anims.idle;
      }



      this.parent();
      
    },
    
    draw: function(){
      this.parent();
      
      // var x =ig.system.width/2;
      // var y = ig.system.height/2;

      // new ig.AnimationSheet( 'media/null_towers.png', 24, 24 ),
      // var cursor = ig.highlighted.animSheet;
      
      if(this.outputMsg == 0){
        this.outputMsg='Click a planet to Connect via Telecaster!';
        // this.font.draw(this.outputMsg,x,y,ig.Font.ALIGN.CENTER );
      }
      
      // if(this.instructText){
      //  var x = ig.system.width/2,
      //  y = ig.system.height - 100;
      //  this.instructText.draw( 
      //    'Click a planet to Connect via Telecaster!', 
      //    x, y, ig.Font.ALIGN.CENTER );
      // }
      
      if(this.showStats){
        this.statMatte.draw(0,0);
        var x = ig.system.width/2;
        var y = ig.system.height/2 - 20;
        this. statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
        this. statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
        this. statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
        this. statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
        this. statText.draw('Press Spacebar to continue.', x, ig.system.height - 10, 
        ig.Font.ALIGN.CENTER);
      }
      
    },
    

    

    loadLevel: function( data ) {
      this.stats = {time: 0, kills: 0, deaths: 0};
      this.parent(data);
      this.levelTimer.reset();
    },
    
    toggleStats: function(levelExit){
      this.showStats = true;
      this.stats.time = Math.round(this.levelTimer.delta());
      this.levelExit = levelExit;
    },
    
    gameOver: function(){
      ig.game.stats.deathText += this.outputMsg;
      ig.finalStats = ig.game.stats;
      ig.system.setGame(GameOverScreen);
    },

    buildTowerList: function(){
      var allTowers = ig.game.getEntitiesByType( EntityTower );
      var index;
      for (index = 0; index < allTowers.length; ++index) {
          // console.log(a[index]);
          this.towerList = allTowers;
      }

    },

    checktowerPlacement: function(){
      // if((this.towerList[0].pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
      // ((ig.input.mouse.x + ig.game.screen.x) <= this.towerList[0].pos.x + this.towerList[0].size.x) &&
      // (this.towerList[0].pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
      // ((ig.input.mouse.y + ig.game.screen.y) <= this.towerList[0].pos.y + this.towerList[0].size.y)){
      //   // this.theCursor.currentAnim = this.theCursor.anims.first;
      //   // this.currentAnim = this.anims.idle;
      // }
      if(ig.input.pressed('lbtn')){
        if( !this.theCursor.isTouching ){
          var towerX = Math.floor(this.theCursor.pos.x/24);
          var towerY = Math.floor(this.theCursor.pos.y/24);

          // console.log(towerX,towerY);
          if(towerY > 0 && towerX > 0){
            var newTower = ig.game.spawnEntity( EntityTower, 
                                towerX*24, 
                                towerY*24,
                                {towerType:this.towerBuild,
                                  faction:10}
                                ); 

          }
          

        }else{
          //
        }

        this.towerBuild = 0;
      }
      
    },

    randomNumGen: function(smallest,largest){
      return (smallest + Math.floor(Math.random()*largest-smallest+1));
    },
  
    // loadProfile: function(){
  //     // console.log(this.allPlanetProfiles.profiles.length);
      
  //     if (this.highlighted.profile == 0){
  //       var items = ig.game.allPlanetProfiles.profiles;
  //       var index = Math.floor(Math.random()*items.length);
  //       // console.log(index);
  //       var item = items[index];
  //       this.highlighted.profile = item;
  //       this.outputMsg = item.text;
  //       // this.stats.crew += item.crew;
  //       this.stats.hull += item.hull;
  //       this.additionalModsViaProfileName(item.name);

  //       if(item.fuel > 10){
  //         this.highlighted.setAsFuelPlanet();
  //       }else{
  //         this.highlighted.setAsDullPlanet();
  //       }
  //       if (item.crew < 0){
  //         if(this.stats.crew < -item.crew){
  //           this.stats.deaths += this.stats.crew;
  //           this.stats.crew = 0;
  //         }else{
  //           this.stats.deaths += -item.crew;
  //           this.stats.crew += item.crew;
  //         }
          
  //       }else{
  //         this.stats.crew += item.crew;
  //       }

  //       this.stats.crystal += item.crystal;

        
  //     }//end of big if

  //     var fuelReward=0;
  //     if(this.highlighted.timesVisited > 0){
  //       if(this.highlighted.home ){
  //         fuelReward = this.highlighted.profile.fuel - this.highlighted.timesVisited;
  //       }else{
  //         fuelReward = this.highlighted.profile.fuel - this.highlighted.timesVisited*5;
  //       }

  //       if(fuelReward >= 0){
  //         if(this.highlighted.home){
  //           this.outputMsg = "Your homeworld showers you in praise, and fuel.";
  //         }else{
  //           this.outputMsg = "This world repeats in gift of fuel.";
  //         }
  //         this.stats.fuel += fuelReward;
  //       }else{
  //         if(this.highlighted.home){
  //           this.outputMsg = "Your homeworld has no more fuel to spare.";
  //         }else{
  //           this.outputMsg = "This world cannot give any more fuel.";
  //         }
  //       }

  //     }//end timesvisited > 0 if
      
  //     this.highlighted.timesVisited += 1;


  //     if(this.stats.crystal < 0){
  //       this.stats.crystal = 0;
  //     }
  //     if(this.stats.crew < 0){
  //       this.stats.crew = 0;
  //     }
  //     if(this.stats.fuel < 0){
  //       this.stats.fuel = 0;
  //     }

  //   },

  //   setHomeProfile: function(homePlanet){
  //     var items = ig.game.homePlanetProfiles.profiles;
  //     var index = Math.floor(Math.random()*items.length);
  //     // console.log(index);
  //     var item = items[index];
  //     homePlanet.profile = item;
  //     this.outputMsg = item.text;
  //     // this.stats.crew += item.crew;
  //     this.stats.hull += item.hull;
  //     this.additionalModsViaProfileName(item.name);

  //     this.stats.crew += item.crew;
  //     this.stats.hull += item.hull;
  //     this.stats.fuel += item.fuel;
  //     this.stats.crystal += item.crystal;

  //     homePlanet.setAsHomePlanet();

  //   },

  //   deductFuelViaDistance: function(){
  //     var adjFactor = 0.1; 
  //     var distanceX = this.highlighted.pos.x - this.lastHL.pos.x;
  //     var distanceY = this.highlighted.pos.y - this.lastHL.pos.y;

  //     var distanceH = Math.sqrt(Math.pow(distanceX,2) + Math.pow(distanceY,2)) * adjFactor; 

  //     this.stats.fuel -= Math.floor(distanceH) ;
  //   },

  //   checkForNegativeResources: function(){ //
  //     if(this.stats.fuel <= 0 ){
  //       this.stats.deathText = "You ran out of fuel.\n";
  //       this.gameOver();
  //     }
  //     if(this.stats.hull <= 0){
  //       this.stats.deathText = "Your hull was destroyed.\n";
  //       this.gameOver();
  //     }
  //     if( this.stats.crew <= 0   ){

  //       this.stats.deathText = "The ship no longer has a crew.\n";
  //       this.gameOver();
  //     }

  //   },

  //   spawnAllThePlanets: function(){
  //     var totalPlanets = 100;
  //     for (i = 0; i < totalPlanets; i++) { 
  //       var allPlanets = ig.game.getEntitiesByType( EntityPlanet );
  //       var mapX = ig.game.collisionMap.width * 24;
  //       var mapY = ig.game.collisionMap.height * 24;
  //       // console.log(mapX, mapY);
  //       var maybePlanet = ig.game.spawnEntity( EntityPlanet,
  //                                      40 + Math.floor(Math.random()*mapX),
  //                                      40 + Math.floor(Math.random()*mapY)
  //                                        );
  //       // console.log(maybePlanet.pos.x , maybePlanet.pos.y); //

  //       for(j=0;j<allPlanets.length;j++){
  //         if(Math.abs(allPlanets[j].pos.x - maybePlanet.pos.x) < 40
  //           & Math.abs(allPlanets[j].pos.y - maybePlanet.pos.y) < 40 ){ //
  //           // console.log(allPlanets[j].pos.x ,
  //           //  maybePlanet.pos.x,
  //           //  allPlanets[j].pos.y ,
  //           //   maybePlanet.pos.y);
  //           maybePlanet.kill();
  //           totalPlanets++;
  //           break;
  //         }
  //       }//end looking for
  //     }//end outer rand for
  //     // console.log(totalPlanets);
  //   },//end spawn func

  //   additionalModsViaProfileName: function(name){
  //     if(name == "Gas Giant"){
  //       this.stats.fuel += this.randomNumGen(1,20);
  //       this.stats.crew -= this.randomNumGen(1,5);
  //       this.stats.hull -= this.randomNumGen(1,5);
  //     }

  //   },

  //   randomNumGen: function(smallest,largest){
  //     return (smallest + Math.floor(Math.random()*largest-smallest+1));
  //   },

  //   checkForScreenOutsideMap: function(){
  //     //ig.system.width , height
  //     //ig.game.collisionMap.width, height
  //     //this.screen.x,y
  //     var mapX = ig.game.collisionMap.width * 24;
  //     var mapY = ig.game.collisionMap.height * 24;

  //     // console.log(this.screen.x,
  //     //             this.screen.y,
  //     //             mapX,
  //     //             mapY,
  //     //             ig.system.width,
  //     //             ig.system.height);

  //     if(this.screen.x + ig.system.width > mapX){
  //       this.screen.x = mapX - ig.system.width;
  //     }else if(this.screen.x < 0){
  //       this.screen.x = 0;
  //     }

  //     if(this.screen.y + ig.system.height > mapY){
  //       this.screen.y = mapY - ig.system.height;
  //     }else if(this.screen.y < 0){
  //       this.screen.y = 0;
  //     }

  //   } //end cehck for screen bounds func
    
  }); //end game enitity thing
  
  
  StartScreen = ig.Game.extend({
    instructText: new ig.Font( 'media/04b03.font.png' ),
    background: new ig.Image('media/null_screen.png'),
    // mainCharacter: new ig.Image('media/screen-main-character.png'),
    // title: new ig.Image('media/game-title.png'),
    
    init: function() {
      ig.input.initMouse();
      ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );
    },
    
    update: function() {
      if(ig.input.pressed ('lbtn')){
        ig.system.setGame(MyGame)
      }
      this.parent();
    },
    
    draw: function() {
      this.parent();
      this.background.draw(0,0);
      // this.mainCharacter.draw(0,0);
      // this.title.draw(ig.system.width - this.title.width, 0);
      var x = ig.system.width/2,
      y = ig.system.height - 100;
      this.instructText.draw( 'Click/Tap To Start', x+30, y, 
      ig.Font.ALIGN.CENTER );
    }
  });
  
  GameOverScreen = ig.Game.extend({
    instructText: new ig.Font( 'media/04b03.font.png' ),
    background: new ig.Image('media/null_screen.png'),
    gameOver: new ig.Image('media/game_over.png'),
    stats: {},
    outputMsg: "",
    
    init: function() {
      ig.input.initMouse();
      ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );
      this.stats = ig.finalStats;
    },
    
    update: function() {
      if(ig.input.pressed('lbtn')){
        ig.system.setGame(StartScreen)
      }
      this.parent();
    },
    
    draw: function() {
      var crystalScore = 55;
      var crewScore = 91;
      this.parent();
      this.background.draw(0,0);
      var x = ig.system.width/2;
      var y = ig.system.height/2 - 20;
      this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
      var score = (this.stats.crystal * crystalScore) - (this.stats.deaths * crewScore);
      this.instructText.draw('Total Crystals Acquired: '+this.stats.crystal, x, y+30, 
        ig.Font.ALIGN.CENTER);
      this.instructText.draw('Total Crew Lost: '+this.stats.deaths, x, y+40, 
        ig.Font.ALIGN.CENTER);
      this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
      this.instructText.draw('Click/Tap To Continue.', x, ig.system.height - 
        100, ig.Font.ALIGN.CENTER);

      this.instructText.draw(this.stats.deathText,
          ig.system.width/2,
          ig.system.height*(0.1),
          ig.Font.ALIGN.CENTER );
    }
  });
  
  
  
  
  
  
  
  var game_x, game_y, game_z;
  
  if( ig.ua.mobile ) {
    // Disable sound for all mobile devices
    ig.Sound.enabled = false;
    game_x =322;
    game_y =368; // 
    game_z =3;
  }else{
    game_x =400; 
    game_y =320;
    game_z =2;
  }
  
  /*
  game_x =312;
  game_y =468;
  game_z =2;
  */
  ig.main('#canvas',StartScreen,60,game_x,game_y,game_z);
  //ig.main('#canvas',MyGame,60,312,468,2);
  //ig.main('#canvas',MyGame,60,624,936,2);
  //ig.main('#canvas',MyGame,60,1248,1872,0.5);

});


