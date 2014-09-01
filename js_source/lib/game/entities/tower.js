ig.module(
  'game.entities.tower'
)
.requires(
  'impact.entity',
  'impact.sound',
  'game.entities.guard',
  'game.imageblender'
)
.defines(function(){
  EntityTower = ig.Entity.extend({
    zIndex:100, //
    animSheet: new ig.AnimationSheet( 'media/null_towers.png', 24, 24 ),

    size: {x: 24, y:24},
    centerPos: {x:0,y:0},
    flip: false,
    drag:false,

    maxVel: {x: 100, y: 150},
    friction: {x: 500, y: 500},
    accelGround: 400,
    accelAir: 200,
    jump: 200,

    animSpeed: 0.0009,

    fireDistance: 80,
    fireSpeed:0.5,  //larger numbers increase firing speed// in hz
    fireTimer: new ig.Timer(1/this.fireSpeed), 

    adjTowers:[],
    
    mouseRel: {x:0,y:0},
    
    health: 1,
    maxHealth: 20,

    energy: 1,
    maxEnergy: 20,
    reqEnergyToShoot: 5, //

    regen:1,
    healRate:0.5,

    resourceBonus:0,
    
    highlight:0,
    profile: 0,
    planetColor: [25,45,65],
    home: false,
    timesVisited: 0,
    
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.FIXED,

    towerType: 0,

    faction:0,

    
    invincible: true,
    invincibleDelay: 2,
    invincibleTimer:null,
    
    jumpSFX: new ig.Sound( 'media/sounds/jump.*' ),
    shootSFX: new ig.Sound( 'media/sounds/shoot.*' ),
    deathSFX: new ig.Sound( 'media/sounds/death.*' ),

    
    init: function( x, y, settings ) {
    
      
      //this.setupAnimation(this.weapon);
      // this.startPosition = {x:x,y:y};

      this.invincibleTimer = new ig.Timer();
      // this.fireTimer = new ig.Timer(0);
      // this.invincibleTimer = new ig.Timer();
      if(settings.towerType){
        this.towerType = settings.towerType;

      }else{
        // this.towerType = 0;
      }

      this.faction = settings.faction;

      this.addAnim( 'idle', 1, [this.towerType] );

      if(this.towerType == 0){
        this.reqEnergyToShoot = 0;
      }
      if(this.towerType == 0 | this.towerType == 9){
        var mapX = ig.game.collisionMap.width * ig.game.collisionMap.tilesize;
        var mapY = ig.game.collisionMap.height * ig.game.collisionMap.tilesize;
        var hypotenuse = Math.sqrt( Math.pow(mapX,2) + Math.pow(mapY,2) );
        // this.fireDistance = hypotenuse +1;
        this.fireDistance = 1000;
        // this.fireTimer = new ig.Timer(1/this.fireSpeed);
        // console.log(this.guardSpawnTimer.delta(),"timer test"); //
      }else if(this.towerType == 2){
        this.fireSpeed = 0.5;
        this.fireDistance = 60;
      }else if(this.towerType == 1){
        this.fireSpeed = 6;
      }else if(this.towerType == 3){
        this.fireSpeed = 0.5;
        this.fireDistance = 160;
        this.maxEnergy = 51;
        this.reqEnergyToShoot = 50;
      }else if(this.towerType == 4){
        this.fireSpeed = 1;
        // this.fireDistance = 60;
        // this.fireDistance = 160;
      }else if(this.towerType == 5){
        this.fireSpeed = 1;
      }else if(this.towerType == 6 ){
        this.fireSpeed = 1;
        this.resourceBonus = 3;
      }else if( this.towerType == 7 ){
        this.fireSpeed = 1;
        this.resourceBonus = 8;
      }else if(this.towerType == 8){
        this.health = 50;
        this.maxHealth = 50;
      }

      this.parent( x, y, settings );


      this.centerPos.x = this.pos.x+this.size.x/2;
      this.centerPos.y = this.pos.y+this.size.y/2;

      this.findAdjTowersInit();

      // this.addAnim( 'run', this.animSpeed, [1,2,3,4] );
      // this.addAnim( 'jump', 1, [6] );
      // this.addAnim( 'fall', 1, [0] );
      
      // var leftup = 42;
      // this.addAnim( 'run_leftup', this.animSpeed, [1+leftup,2+leftup,3+leftup,4+leftup] );
      // var left = 36;
      // this.addAnim( 'run_left', this.animSpeed, [1+left,2+left,3+left,4+left] );
      // var leftdown = 30;
      // this.addAnim( 'run_leftdown', this.animSpeed, [1+leftdown,2+leftdown,3+leftdown,4+leftdown] );
      // var rightup = 6;
      // this.addAnim( 'run_rightup', this.animSpeed, [1+rightup,2+rightup,3+rightup,4+rightup] );
      // var right = 12;
      // this.addAnim( 'run_right', this.animSpeed, [1+right,2+right,3+right,4+right] );
      // var rightdown = 18;
      // this.addAnim( 'run_rightdown', this.animSpeed, [1+rightdown,2+rightdown,3+rightdown,4+rightdown] );
      // var down = 24;
      // this.addAnim( 'run_down', this.animSpeed, [1+down,2+down,3+down,4+down] );


    },
    
    inFocus: function() {
        return (
           (this.pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
           ((ig.input.mouse.x + ig.game.screen.x) <= this.pos.x + this.size.x) &&
           (this.pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
           ((ig.input.mouse.y + ig.game.screen.y) <= this.pos.y + this.size.y)
        );
     },

    update: function() {
      //creates turret
      this.vel.x = this.vel.y = 0 ;
      if( this.invincibleTimer.delta() > this.invincibleDelay ) {
        this.invincible = false;
        // this.currentAnim.alpha = 1;
      }

      this.currentAnim = this.anims.idle;
      if (ig.input.pressed('lbtn') && this.inFocus()) {
            // ig.log('clicked');
            // this.highlight = 
        //     if (this.highlight==0 && ig.game.highlighted != this){
        //       ig.game.highlighted = this;
        //       this.highlight = ig.game.spawnEntity( EntityHighlight, 
        //                         this.pos.x, 
        //                         this.pos.y, 
        //                         {flip:this.flip, angle:0.0, par:this} 
        //                         ); //Nothing to special here, just make sure you pass the angle we calculated in
              
        //   this.highlight.zIndex=this.zIndex+2;
        // }
        }else{
          // if (!(this.highlight==0)){
          //  this.highlight.kill();
          // } //
        }

        if(ig.game.highlighted != this && this.highlight != 0){
          this.highlight.kill();
          this.highlight = 0;
        }
      
      if(this.towerType < 6 && this.towerType >= 0){
        //needs to shoot
        this.targetAndShoot();
      } else if (this.towerType == 6){
        if( this.fireTimer.delta() > 0 ) { //Basic shoot command
          this.fireTimer = new ig.Timer(1/this.fireSpeed );
          ig.game.stats.crystal += this.resourceBonus;
        }
      }else if (this.towerType == 7){
        if( this.fireTimer.delta() > 0 ) { //Basic shoot command
          this.fireTimer = new ig.Timer(1/this.fireSpeed );
          ig.game.stats.fuel += this.resourceBonus;
        }
      }else if(this.towerType == 9){
        if(this.fireTimer.delta() > 0){
          var newGuard = ig.game.spawnEntity( EntityGuard, 
                                this.pos.x+18, 
                                this.pos.y+48,
                                {faction:this.faction}
                                ); 

          // console.log(newGuard,"guard");
          this.fireTimer = new ig.Timer(1/this.fireSpeed);
        }
      }
      // move!

      this.transferAdjResources();

      this.healThySelf();

      this.parent();
    },
    
    
    draw: function(){

      var offset = 0, xOffset = 0; //  

      var ctx = ig.system.context;

      var tileSize = 24;

      var fireBar = Math.abs(this.fireTimer.delta()/(1/this.fireSpeed));

      if(fireBar < 0){
        fireBar = 0;
      }else if(fireBar > 1){
        fireBar = 1;
      }
      

      //grey box
      ctx.fillStyle = "rgba(155,155,155,0.9)";
      ctx.beginPath();
      ctx.rect( (this.pos.x - ig.game.screen.x) * ig.system.scale,
                (this.pos.y - ig.game.screen.y)  * ig.system.scale,
                tileSize * ig.system.scale, //
                tileSize * ig.system.scale);

      ctx.closePath();
      ctx.fill();

      //health bar
      ctx.fillStyle = "rgb(255,0,0)";
      ctx.beginPath();
      ctx.rect(
          (this.pos.x - ig.game.screen.x + 1) * ig.system.scale, 
          (this.pos.y - ig.game.screen.y - 1) * ig.system.scale, 
          ((this.size.x - 2) * (this.health / this.maxHealth)) * ig.system.scale, 
          2 * ig.system.scale
                );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgb(190,0,240)";
      ctx.beginPath();
      ctx.rect(
          (this.pos.x - ig.game.screen.x + 1) * ig.system.scale, 
          (this.pos.y - ig.game.screen.y + this.size.y - 1) * ig.system.scale, 
          ((this.size.x - 2) * (fireBar)) * ig.system.scale, 
          2 * ig.system.scale
                );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgb(100,250,100)";
      ctx.beginPath();
      ctx.rect(
          (this.pos.x - ig.game.screen.x + this.size.x - 2) * ig.system.scale, 
          (this.pos.y - ig.game.screen.y + 1) * ig.system.scale, //
          2 * ig.system.scale,
          ((this.size.y - 2) * (this.energy/this.maxEnergy)) * ig.system.scale
                );
      ctx.closePath();
      ctx.fill();


      this.parent();
    },

    makeInvincible: function(){
      this.invincible = true;
      this.invincibleTimer.reset();
    },

    kill: function(){
      //this.deathSFX.play();
      // this.turret.kill();
      this.parent();
      // ig.game.respawnPosition = this.startPosition;
      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, 
        {callBack:this.onDeath} );
      if(this.highlight){
        this.highlight.kill();
      }
      if(true | this.towerType == 0){
        var allTowers = ig.game.towerList;
        var index = allTowers.indexOf(this);
        if (index > -1) {
          ig.game.towerList.splice(index, 1);
        }else{
<<<<<<< HEAD
          console.log("tower missing from allTowers"); //eror
=======
          // console.log("tower missing from allTowers"); //eror
>>>>>>> 23532a63de834b1cdd9d94f927f7822e547a2118
        }

      }
      
    },
    
    // makeInvincible: function(){
    //   this.invincible = true;
    //   this.invincibleTimer.reset();
    // },

    handleMovementTrace: function( res ) {
      this.parent( res );
      if( res.collision.x || res.collision.y ){
        // this.kill();
      }
    },

    check: function( other ) {
      other.receiveDamage( 0.1, this );
      other.accel.x *= (-2);
      other.accel.y *= (-2); //
      // this.kill();
    },
    
    receiveDamage: function(amount, from){
      if(this.invincible)
      {
        return;
      }else{
        this.invincibleDelay=0.3;
        this.makeInvincible();
      }
      this.parent(amount, from);
    },
    
    onDeath: function(){
      ig.game.stats.deaths++;
      ig.game.lives--;
      if(ig.game.lives < 0){
        // ig.game.gameOver();
      }else{
        // ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, 
        // ig.game.respawnPosition.y);
      }
    },

    targetAndShoot: function(){
      var targetTowerList = ig.game.getEntitiesByType( EntityTower );
      var targetGuardList = ig.game.getEntitiesByType( EntityGuard );
      var targetObj = 0;
      for(var index = 0;index<targetTowerList.length;index++){
        if(targetObj){break;}
        var possibleTarget = targetTowerList[index];
        if(possibleTarget.faction != this.faction && this.distanceTo( possibleTarget ) < this.fireDistance){
          targetObj = possibleTarget;
        }
          // && (Math.pow(possibleTarget.pos.x - this.pos.x,2)
          //   +Math.pow(possibleTarget.pos.x - this.pos.x,2))

            // ){

      }

      for(var index = 0;index<targetGuardList.length;index++){
        if(targetObj){break;}
        var possibleTarget = targetGuardList[index];
        if(possibleTarget.faction != this.faction && this.distanceTo( possibleTarget ) < this.fireDistance){
          targetObj = possibleTarget;
        }


      }

      // if(targetObj){
      //   ig.game.spawnEntity( 
      //               EntityMouseBullet, 
      //               this.pos.x, 
      //               this.pos.y, 
      //               {angle:this.angleTo( targetObj )} )
      //               ; //Nothing to special here, just make sure you pass the angle we calculated in

      // }

      if( targetObj && this.fireTimer.delta() > 0 ) { //Basic shoot command
        
              
        
        // var mx = (ig.input.mouse.x + ig.game.screen.x); //Figures out the x coord of the mouse in the entire world
        // var my = (ig.input.mouse.y + ig.game.screen.y); //Figures out the y coord of the mouse in the entire world
        
        // this.mouseRel.x = ig.input.mouse.x;
        // this.mouseRel.y = ig.input.mouse.y;
        
        // var px =this.pos.x + this.size.x/2 + this.offset.x/2;
        // var py = this.pos.y + this.size.y/2 + this.offset.y/2;

        var targetAngle = this.angleTo( targetObj );
        
        var angx = Math.cos(targetAngle);
        var angy = Math.sin(targetAngle);

        var tx = (this.centerPos.x)+angx*(this.size.x+3);
        var ty = (this.centerPos.y)+angy*(this.size.y+3);

        // var tx = this.turret.pos.x+(this.turret.size.x-6)/2+(angx)*27;
        // var ty = this.turret.pos.y+(this.turret.size.y-4)/2+(angy)*27;
        
        // ig.log( 'tur pos x ', this.turret.pos.x,' tx',tx ,'angx',angx);
        // ig.log( 'tur pos y ', this.turret.pos.y,' ty',ty ,'angy',angy);
        
        // var r = Math.atan2(my-py, mx-px);
        
        //var r = Math.atan2(my-this.pos.y, mx-this.pos.x); //Gives angle in radians from player's location to the mouse location, assuming directly right is 0
         /*
         Honestly, the above should probably take into account offsets of where your gun is located, 
         but that greatly overcomplicates this snippet since most of you are going to have different exit points for the barrel of your weapons

         Furthermore, each weapon might even have different exit points, so you might want to move the angle calculation into the init method of
         each bullet
         */
        //ig.log(  'test' ); // round before output
        //ig.log( 'angle', r );
        //r=r*1000;
        if(this.energy >= this.reqEnergyToShoot){
          this.energy -= this.reqEnergyToShoot;
          this.fireTimer = new ig.Timer(1/this.fireSpeed );

          if(this.towerType == 0 && this.faction != 10){
            var newGuard = ig.game.spawnEntity( EntityGuard, 
                                  this.pos.x+18, 
                                  this.pos.y+48,
                                  {faction:this.faction}
                                  ); 
          }else if(this.towerType == 1){
            ig.game.spawnEntity( EntityMouseBullet, 
                                tx, 
                                ty, 
                                {angle:targetAngle,
                                  faction:this.faction,
                                  lifetime:1} ); 
          }else if(this.towerType == 2){
            // console.log(this.pos.x,this.pos.y,this.centerPos.x, this.centerPos.y);
            ig.game.spawnEntity( EntityAOECircle, 
                                this.centerPos.x, 
                                this.centerPos.y, 
                                {faction:this.faction} ); 
          }else if(this.towerType == 3){
            ig.game.spawnEntity( EntityMouseBullet, 
                                tx, 
                                ty, 
                                {angle:targetAngle,
                                  faction:this.faction,
                                  color:"#0000FF",
                                  damage:30,
                                  desiredVel:200,
                                } ); 
          }else if(this.towerType == 4){
            for(var i =0;i<10;i++){
              var spreadAngle = targetAngle + (ig.game.randomNumGen(-90,90) / 360); //degrees
              // console.log(spreadAngle);
              ig.game.spawnEntity( EntityMouseBullet, 
                                tx, 
                                ty, 
                                {angle:spreadAngle,
                                  faction:this.faction,
                                  color:"#880099",
                                  lifetime:0.3,
                                  damage:0.1,
                                  desiredVel:200,
                                  animSheet:{sheet:'media/bullet.png', 
                                              x:5, y:3},
                                } ); 
            }
          }else if(this.towerType == 5){
            // EntityLine
            if(targetObj.line==null){
              ig.game.spawnEntity( EntityLine ,
                                    this.centerPos.x,
                                    this.centerPos.y,
                                    {target:targetObj}
                                    );

            }
          }

        }//endof reqtoshoot



      }else{
        //
      }

      
    },

    findAdjTowersInit: function(){
      var allTowerList = ig.game.getEntitiesByType( EntityTower );
      var margins = 2;
      for(var index=0;index<allTowerList.length;index++){
        var possibleTower = allTowerList[index];
        if(possibleTower.faction == this.faction){
          if(Math.abs(possibleTower.pos.x - this.pos.x) < this.size.x+margins &&
            Math.abs(possibleTower.pos.y - this.pos.y) < this.size.y+margins){
            //friednly and adj
            // console.log(possibleTower.pos);
            this.adjTowers.push(possibleTower);
            possibleTower.adjTowers.push(this);
          }
        }
      }
    },

    transferAdjResources: function(){
      var allTowerList = this.adjTowers;
      if(allTowerList.length > 4){
        // console.log(allTowerList);
      }
      for(var index=0;index<allTowerList.length;index++){
        var possibleTower = allTowerList[index];
        if(possibleTower.faction == this.faction){
          if(Math.abs(possibleTower.pos.x - this.pos.x) < this.size.x+1 &&
            Math.abs(possibleTower.pos.y - this.pos.y) < this.size.y+1){
            //friednly and adj
            // console.log(possibleTower.pos);
            if(this.towerType == 0){
              if(possibleTower.energy+1 < possibleTower.maxEnergy &&
                ig.game.stats.fuel > this.regen
                ){
                possibleTower.energy += this.regen;
                if(this.faction == 10){
                  ig.game.stats.fuel -= this.regen;
                }
              }
            }else{
              if(possibleTower.energy+1 < possibleTower.maxEnergy &&
                this.energy > this.regen
                ){
                possibleTower.energy += this.regen;
                this.energy -= this.regen;
              }
            }
            
          }
        }
      }
    },

    healThySelf: function(){
      if(this.health+1<this.maxHealth &&
        this.energy > this.healRate*2 &&
        ig.game.stats.crystal > this.healRate*2){
        this.health += this.healRate;
        this.energy -= this.healRate*2;
        ig.game.stats.crystal > this.healRate*2;
      }
    }
    
    // setAsHomePlanet: function(){
    //   var homeHighlight = ig.game.spawnEntity( EntityHighlight, 
    //                         this.pos.x, 
    //                         this.pos.y, 
    //                         {flip:this.flip, angle:0.0, par:this, color:"#115FFB"} 
    //                         ); //Nothing to special here, just make sure you pass the angle we calculated in
              
    //   homeHighlight.zIndex=this.zIndex+2;
    //   this.home = true;
    //   this.timesVisited +=1;
    // },

    // setAsDullPlanet: function(){
    //   var homeHighlight = ig.game.spawnEntity( EntityHighlight, 
    //                         this.pos.x, 
    //                         this.pos.y, 
    //                         {flip:this.flip, angle:0.0, par:this, color:"#424242"} 
    //                         ); //Nothing to special here, just make sure you pass the angle we calculated in
              
    //   homeHighlight.zIndex=this.zIndex+2;
    // },

    // setAsFuelPlanet: function(){
    //   var homeHighlight = ig.game.spawnEntity( EntityHighlight, 
    //                         this.pos.x, 
    //                         this.pos.y, 
    //                         {flip:this.flip, angle:0.0, par:this, color:"#19FB11"} 
    //                         ); //Nothing to special here, just make sure you pass the angle we calculated in
              
    //   homeHighlight.zIndex=this.zIndex+2;
    //   // this.home = true;
    //   // this.timesVisited +=1;
    // }
    
    // kill: function(){
    //  //this.deathSFX.play();
    //  this.turret.kill();
    //  this.parent();
    //  ig.game.respawnPosition = this.startPosition;
    //  ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, 
    //    {callBack:this.onDeath} );
    // },
    
    // makeInvincible: function(){
    //  this.invincible = true;
    //  this.invincibleTimer.reset();
    // },
    
    // receiveDamage: function(amount, from){
    //  if(this.invincible)
    //  {
    //    return;
    //  }else{
    //    this.invincibleDelay=0.3;
    //    this.makeInvincible();
    //  }
    //  this.parent(amount, from);
    // },
    
    // onDeath: function(){
    //  ig.game.stats.deaths++;
    //  ig.game.lives--;
    //  if(ig.game.lives < 0){
    //    ig.game.gameOver();
    //  }else{
    //    ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, 
    //    ig.game.respawnPosition.y);
    //  }
    // },
    
    

  }); //end of player
  
  EntityHighlight = ig.Entity.extend({
    zIndex:500,
    animSheet: new ig.AnimationSheet( 'media/planet_new_highlight.png', 60, 60 ),
    //offset:{x:9,y:5},
    shift:{x:0,y:0},
    
    //maxVel: {x: 200, y: 0},
    type: ig.Entity.TYPE.NONE,
    angle:0,
    color:"white",
    //checkAgainst: ig.Entity.TYPE.B,
    //collides: ig.Entity.COLLIDES.PASSIVE,
    
    
    
    init: function( x, y, settings ) {
    
      var offset = -12, xOffset = 0; 
      // var flipsetting, velsetting;
      // if(settings.flip){
      //  flipsetting = -4;
      //  velsetting = -this.maxVel.x;
      // }else{
      //  flipsetting = 8;
      //  velsetting = this.maxVel.x;
      // }
      this.parent( x + offset +xOffset , y + offset, settings );
      //this.vel.x = this.accel.x = velsetting;
      this.addAnim( 'idle', 1, [0] );

      // console.log(this.color);
      if(this.color != "white"){
        var sheet1 = new ig.AnimationSheet( 'media/planet_new_highlight.png'+this.color, 60, 60 );
        this.anims.idle = new ig.Animation( sheet1, 1, [0] );
    
      }
      this.currentAnim = this.anims.idle;

    },
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      
    },
    
    update: function(){
      

      this.parent();
    },

    draw: function(){
      // var img = new ig.Image( 'media/planet_highlight.png#ff00ff' );
      // img.draw( 100, 100 );

      this.parent();
    },

    check: function( other ) {
      //other.receiveDamage( 3, this );
      //this.kill();
    },
    
  });   //end of bullet

  EntityLine = ig.Entity.extend({
        start: {},
        finish: {},
        zIndex: 400,

        targetObj:null,

        lifetime: 1,
 
        init: function(x, y, settings) {
          this.parent(x,y,settings);

          this.targetObj = settings.target ;

          this.targetObj.line = this;

          this.idleTimer = new ig.Timer();

        },
 
        update: function() {
          
          if(this.targetObj==null){
            this.kill();
          }
          if( this.lifetime && this.idleTimer.delta() > this.lifetime ) {
            this.kill();
          }

          this.parent();
          this.target.x = this.targetObj.centerPos.x ;
          this.target.y = this.targetObj.centerPos.y ;
        },

        draw: function() {
          var guideColor = "rgba(155,155,245,0.3)";
          var guideRadius = 5;

          var offset = 0;
          var startX = ig.system.getDrawPos(this.pos.x - ig.game.screen.x + offset);
          var startY = ig.system.getDrawPos(this.pos.y - ig.game.screen.y + offset);
                
          var endX = ig.system.getDrawPos(this.target.x-ig.game.screen.x + offset);
          var endY = ig.system.getDrawPos(this.target.y-ig.game.screen.y + offset);

          var ctx = ig.system.context;
                
          ctx.strokeStyle = guideColor; //
          ctx.lineWidth = 4.5;
          ctx.beginPath();
          ctx.moveTo(startX,startY);
          ctx.lineTo(endX,endY);
          ctx.stroke();
          ctx.closePath();
          

          
          ctx.beginPath();
          // ctx.strokeStyle = guideColor;  //some color
          ctx.fillStyle = guideColor;
          ctx.arc( startX,
                  startY,
                  guideRadius * ig.system.scale,
                  0, 
                  Math.PI * 2 );
          ctx.arc( endX,
                  endY,
                  guideRadius * ig.system.scale,
                  0, 
                  Math.PI * 2 );
          // ctx.stroke();
          ctx.fill();


          ctx.closePath();


        }
    });










}); //end of planet.js




















  
//  EntityBullet = ig.Entity.extend({
//    size: {x: 5, y: 3},
//    animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
//    maxVel: {x: 200, y: 0},
//    type: ig.Entity.TYPE.NONE,
//    checkAgainst: ig.Entity.TYPE.B,
//    collides: ig.Entity.COLLIDES.PASSIVE,
    
    
    
//    init: function( x, y, settings ) {
    
       
//      var flipsetting, velsetting;
//      if(settings.flip){
//        flipsetting = -4;
//        velsetting = -this.maxVel.x;
//      }else{
//        flipsetting = 8;
//        velsetting = this.maxVel.x;
//      }
//      this.parent( x + flipsetting , y+8, settings );
//      this.vel.x = this.accel.x = velsetting;
//      this.addAnim( 'idle', 0.2, [0] );
//    },
    
//    handleMovementTrace: function( res ) {
//      this.parent( res );
//      if( res.collision.x || res.collision.y ){
//        this.kill();
//      }
//    },

//    check: function( other ) {
//      other.receiveDamage( 3, this );
//      this.kill();
//    },
    
//  });   //end of bullet
  
  
//  EntityMouseBullet = ig.Entity.extend({
//    size: {x: 5, y: 3},
//    animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
//    maxVel: {x: 0, y: 0},
//    type: ig.Entity.TYPE.NONE,
//    checkAgainst: ig.Entity.TYPE.B,
//    collides: ig.Entity.COLLIDES.PASSIVE,
    
//    desiredVel: 300,
    
    
//    init: function( x, y, settings ) {
    
//      //this.angle++;
//      ig.log( 'angle', settings.angle );
//      //settings.angle = settings.angle/1000; // //
      
//      this.maxVel.x = this.maxVel.y = this.desiredVel;
      
//      var vely = Math.sin(settings.angle) * this.desiredVel; //.desiredVel is just the velocity I would want if we were going in a straight line directly out of the right of the player. I just put it as a property of the entity since I refer to it in multiple locations
//      var velx =  Math.cos(settings.angle) * this.desiredVel;
//       /*
//       I'm a fan of fullspeed projectiles with no acceleration so we set the velocity, max velocity and for good measure acceleration too.
//       You might want to start with a bit of velocity and some sort of acceleration so your projectile starts off slower and speeds up for something like a rocket 
//       If that's the case, you'll want to do something like the following
//       this.maxVel.x = whatever max you want;
//       this.accel.x = Math.sin(this.angle)  * desiredAcceleration;
//       this.accel.y = Math.cos(this.angle)  * desiredAcceleration;
//       this.vel.x = Math.sin(this.angle)  * desiredStartingVelocity;
//       this.vel.y = Math.cos(this.angle)  * desiredStartingVelocity;
//       */
//      //this.maxVel.x = this.vel.x = this.accel.x = velx;
//      //this.maxVel.y = this.vel.y = this.accel.y = vely;
    
    
//      this.parent( x  , y+8, settings );
//      this.vel.x = this.accel.x = velx;
//      this.vel.y = this.accel.y = vely;
      
//      this.addAnim( 'idle', 0.2, [0] );
//    },
    
    
    
//    handleMovementTrace: function( res ) {
//      this.parent( res );
//      if( res.collision.x || res.collision.y ){
//        this.kill();
//      }
//    },

//    check: function( other ) {
//      other.receiveDamage( 1, this );
//      other.vel.x += this.vel.x/10;
//      other.vel.y += this.vel.y/10;
//      this.kill();
//    },
//    kill: function(){
      
//      this.parent();
//      ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, 
//        {callBack:this.onDeath} );
//    },
    
//  });   //end of bullet
  
//  EntityDeathExplosion = ig.Entity.extend({
//    lifetime: 1,
//    callBack: null,
//    particles: 25,
    
//    init: function( x, y, settings ) {
//      this.parent( x, y, settings );
//      for(var i = 0; i < this.particles; i++)
//        var offsetColor;
//        if(settings.colorOffset)
//        {
//          offsetColor = settings.colorOffset;
//        }else{
//          offsetColor = 0;
//        }
//        ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: offsetColor});
//      this.idleTimer = new ig.Timer();
//    },
//    update: function() {
//    if( this.idleTimer.delta() > this.lifetime ) {
//      this.kill();
//      if(this.callBack)
//        this.callBack();
//        return;
//      }
//    },
    
//  });
  
  
//  EntityDeathExplosionParticle = ig.Entity.extend({
//    size: {x: 2, y: 2},
//    maxVel: {x: 160, y: 200},
//    lifetime: 3,
//    fadetime: 2,
//    bounciness: 0,
//    vel: {x: 100, y: 30},
//    friction: {x:100, y: 0},
//    collides: ig.Entity.COLLIDES.LITE,
//    colorOffset: 0,
//    totalColors: 7,
//    animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
//    init: function( x, y, settings ) {
//      this.parent( x, y, settings );
//      var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
//      * (this.totalColors+1));
//      this.addAnim( 'idle', 0.2, [frameID] );
//      this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
//      this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
//      this.idleTimer = new ig.Timer();
//    },
//    update: function() {
//      if( this.idleTimer.delta() > this.lifetime ) {
//        this.kill();
//        return;
//      }
//      this.currentAnim.alpha = this.idleTimer.delta().map(
//        this.lifetime - this.fadetime, this.lifetime,1, 0);
//      this.parent();
//    }
  // });
  
  
  
  
  
  
  
  
//  EntityDamageExplosion = ig.Entity.extend({
    
//    callBack: null,
//    particles: 25,
    
//    checkAgainst: ig.Entity.TYPE.BOTH,
    
//    init: function( x, y, settings ) {
//      this.parent( x, y, settings );
//      for(var i = 0; i < this.particles; i++)
//        var offsetColor;
//        if(settings.colorOffset)
//        {
//          offsetColor = settings.colorOffset;
//        }else{
//          offsetColor = 0;
//        }
//        ig.game.spawnEntity(EntityDamageExplosionParticle, x, y, {colorOffset: offsetColor,checkAgainst:this.checkAgainst});
      
//    },
//    update: function() {
    
//      this.kill();
      
//    },
    
//  });
  
  
//  EntityDamageExplosionParticle = ig.Entity.extend({
//    size: {x: 2, y: 2},
//    maxVel: {x: 160, y: 200},
//    lifetime: 3,
//    fadetime: 2,
//    bounciness: 1,
//    vel: {x: 100, y: 100},
//    friction: {x:50, y: 50},
//    collides: ig.Entity.COLLIDES.LITE,
//    colorOffset: 0,
//    totalColors: 7,
//    animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
//    init: function( x, y, settings ) {
//      this.parent( x, y, settings );
//      var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
//      * (this.totalColors+1));
//      this.addAnim( 'idle', 0.2, [frameID] );
//      this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
//      this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
//      this.idleTimer = new ig.Timer();
//    },
//    update: function() {
//      if( this.idleTimer.delta() > this.lifetime ) {
//        this.kill();
//        return;
//      }
//      this.currentAnim.alpha = this.idleTimer.delta().map(
//        this.lifetime - this.fadetime, this.lifetime,1, 0);
//      this.parent();
//    },
//    check: function( other ) {
//      other.receiveDamage( 1, this );
//      other.vel.x += this.vel.x/100;
//      other.vel.y += this.vel.y/100;
//      this.kill();
//    },
//  });
  
// 


/*

ig.module(
  'game.entities.player'
)
.requires(
  'impact.entity',
  'impact.sound'
)
.defines(function(){
  EntityPlayer = ig.Entity.extend({
    animSheet: new ig.AnimationSheet( 'media/player.png', 16, 16 ),
    
    size: {x: 8, y:14},
    offset: {x: 4, y: 2},
    flip: false,
    
    maxVel: {x: 100, y: 150},
    friction: {x: 600, y: 0},
    accelGround: 400,
    accelAir: 200,
    jump: 200,
    
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.PASSIVE,
    
    weapon: 0,
    totalWeapons: 2,
    activeWeapon: "EntityBullet",
    
    startPosition: null,
    
    invincible: true,
    invincibleDelay: 2,
    invincibleTimer:null,
    
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(255, 0, 0, 0.7)',
    
    jumpSFX: new ig.Sound( 'media/sounds/jump.*' ),
    shootSFX: new ig.Sound( 'media/sounds/shoot.*' ),
    deathSFX: new ig.Sound( 'media/sounds/death.*' ),
    
    init: function( x, y, settings ) {
      
      this.setupAnimation(this.weapon);
      this.startPosition = {x:x,y:y};
      this.invincibleTimer = new ig.Timer();
      this.makeInvincible();
      this.parent( x, y, settings );
    },
    
    
    update: function() {
      // move left or right
      var accel = this.standing ? this.accelGround : this.accelAir;
      if( ig.input.state('left') ) {
        this.accel.x = -accel;
        this.flip = true;
      }else if( ig.input.state('right') ) {
        this.accel.x = accel;
        this.flip = false;
      }else{
        this.accel.x = 0;
      }
      // jump
      if( this.standing && ig.input.pressed('jump') ) {
        this.vel.y = -this.jump;
        this.jumpSFX.play();
      }
      // move!
      this.currentAnim.flip.x = this.flip;
      
      // shoot
      if( ig.input.pressed('shoot') ) {
        ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
        this.shootSFX.play();
      }
      
      
      // set the current animation, based on the player's speed
      if( this.vel.y < 0 ) {
        this.currentAnim = this.anims.jump;
      }else if( this.vel.y > 0 ) {
        this.currentAnim = this.anims.fall;
      }else if( this.vel.x != 0 ) {
        this.currentAnim = this.anims.run;
      }else{
        this.currentAnim = this.anims.idle;
      }
      
      if( ig.input.pressed('switch') ) {
        this.weapon ++;
        if(this.weapon >= this.totalWeapons)
          this.weapon = 0;
        switch(this.weapon){
          case(0):
            this.activeWeapon = "EntityBullet";
            break;
          case(1):
            this.activeWeapon = "EntityGrenade";
            break;
        }
        this.setupAnimation(this.weapon);
      }
      
      if( this.invincibleTimer.delta() > this.invincibleDelay ) {
        this.invincible = false;
        this.currentAnim.alpha = 1;
      }

      this.parent();
      
    },
    
    setupAnimation: function(offset){
      offset = offset * 10;
      this.addAnim('idle', 1, [0+offset]);
      this.addAnim('run', .07, [0+offset,1+offset,2+offset,3+offset,4+offset,5+offset]);
      this.addAnim('jump', 1, [9+offset]);
      this.addAnim('fall', 0.4, [6+offset,7+offset]);
    },
    
    kill: function(){
      this.deathSFX.play();
      this.parent();
      ig.game.respawnPosition = this.startPosition;
      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, 
        {callBack:this.onDeath} );
    },
    
    makeInvincible: function(){
      this.invincible = true;
      this.invincibleTimer.reset();
    },
    
    receiveDamage: function(amount, from){
      if(this.invincible)
      {
        return;
      }
      this.parent(amount, from);
    },
    draw: function(){
      if(this.invincible)
      {
        this.currentAnim.alpha = this.invincibleTimer.delta()/this.invincibleDelay * 1 ;
      }
      this.parent();
    },
    
    onDeath: function(){
      ig.game.stats.deaths++;
      ig.game.lives--;
      if(ig.game.lives < 0){
        ig.game.gameOver();
      }else{
        ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, 
        ig.game.respawnPosition.y);
      }
    },
    
    

  });
  
  
  EntityBullet = ig.Entity.extend({
    size: {x: 5, y: 3},
    animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
    maxVel: {x: 200, y: 0},
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,
    
    
    init: function( x, y, settings ) {
      var flipsetting, velsetting;
      if(settings.flip){
        flipsetting = -4;
        velsetting = -this.maxVel.x;
      }else{
        flipsetting = 8;
        velsetting = this.maxVel.x;
      }
      this.parent( x + flipsetting , y+8, settings );
      this.vel.x = this.accel.x = velsetting;
      this.addAnim( 'idle', 0.2, [0] );
    },
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      if( res.collision.x || res.collision.y ){
        this.kill();
      }
    },

    check: function( other ) {
      other.receiveDamage( 3, this );
      this.kill();
    },
    
  });
  
  EntityGrenade = ig.Entity.extend({
    size: {x: 4, y: 4},
    offset: {x: 2, y: 2},
    animSheet: new ig.AnimationSheet( 'media/grenade.png', 8, 8 ),
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.PASSIVE,
    maxVel: {x: 200, y: 200},
    bounciness: 0.6,
    bounceCounter: 0,
    
    
    init: function( x, y, settings ) {
      if(settings.flip){
        flipsetting = -4;
        velsetting = -this.maxVel.x;
      }else{
        flipsetting = 7;
        velsetting = this.maxVel.x;
      }
      this.parent( x + (flipsetting), y, settings );
      this.vel.x = (velsetting);
      this.vel.y = -(50 + (Math.random()*100));
      this.addAnim( 'idle', 0.2, [0,1] );
    },
    
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      if( res.collision.x || res.collision.y ) {
      // only bounce 3 times
        this.bounceCounter++;
        if( this.bounceCounter > 3 ) {
          this.kill();
        }
      }
    },
    
    check: function( other ) {
      other.receiveDamage( 10, this );
      this.kill();
    },
    
    kill: function(){
      for(var i = 0; i < 20; i++)
      ig.game.spawnEntity(EntityGrenadeParticle, this.pos.x, this.pos.y);
      this.parent();
    },
    
  });
  
  
  
  EntityDeathExplosion = ig.Entity.extend({
    lifetime: 1,
    callBack: null,
    particles: 25,
    
    init: function( x, y, settings ) {
      this.parent( x, y, settings );
      for(var i = 0; i < this.particles; i++)
        var offsetColor;
        if(settings.colorOffset)
        {
          offsetColor = settings.colorOffset;
        }else{
          offsetColor = 0;
        }
        ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: offsetColor});
      this.idleTimer = new ig.Timer();
    },
    update: function() {
    if( this.idleTimer.delta() > this.lifetime ) {
      this.kill();
      if(this.callBack)
        this.callBack();
        return;
      }
    },
    
  });
  
  
  EntityDeathExplosionParticle = ig.Entity.extend({
    size: {x: 2, y: 2},
    maxVel: {x: 160, y: 200},
    lifetime: 2,
    fadetime: 1,
    bounciness: 0,
    vel: {x: 100, y: 30},
    friction: {x:100, y: 0},
    collides: ig.Entity.COLLIDES.LITE,
    colorOffset: 0,
    totalColors: 7,
    animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
    init: function( x, y, settings ) {
      this.parent( x, y, settings );
      var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
      * (this.totalColors+1));
      this.addAnim( 'idle', 0.2, [frameID] );
      this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
      this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
      this.idleTimer = new ig.Timer();
    },
    update: function() {
      if( this.idleTimer.delta() > this.lifetime ) {
        this.kill();
        return;
      }
      this.currentAnim.alpha = this.idleTimer.delta().map(
        this.lifetime - this.fadetime, this.lifetime,1, 0);
      this.parent();
    }
  });
  
  
  EntityGrenadeParticle = ig.Entity.extend({
    size: {x: 1, y: 1},
    maxVel: {x: 160, y: 200},
    lifetime: 1,
    fadetime: 1,
    bounciness: 0.3,
    vel: {x: 40, y: 50},
    friction: {x:20, y: 20},
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.LITE,
    animSheet: new ig.AnimationSheet( 'media/explosion.png', 1, 1 ),
    init: function( x, y, settings ) {
      this.parent( x, y, settings );
      this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
      this.vel.y = (Math.random() * 10 - 1) * this.vel.y;
      this.idleTimer = new ig.Timer();
      var frameID = Math.round(Math.random()*7);
      this.addAnim( 'idle', 0.2, [frameID] );
    },
    update: function() {
      if( this.idleTimer.delta() > this.lifetime ) {
        this.kill();
        return;
      }
      this.currentAnim.alpha = this.idleTimer.delta().map(
        this.lifetime - this.fadetime, this.lifetime,1, 0);
      this.parent();
    },
  });
  
});
*/