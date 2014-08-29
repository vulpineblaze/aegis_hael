ig.module(
  'game.entities.guard'
)
.requires(
  'impact.entity'
)
.defines(function(){
  EntityGuard = ig.Entity.extend({
    animSheet: new ig.AnimationSheet( 'media/null_guard.png', 18, 18 ),
    size: {x: 8, y:14},
    offset: {x: 4, y: 2},
    maxVel: {x: 100, y: 100},
    flip: false,
    lookAhead: 4,
    
    friction: {x: 150, y: 150},
    speed: 16,
    
    spawnerTimer:null,
    spawnerDelay:1,
    
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    faction:0,
    
    
    
    init: function( x, y, settings ) {
      this.spawnerTimer = new ig.Timer();
      this.addAnim('walk', 0.01, [0,1,2,3,4,5]);
      this.parent( x, y, settings );


      this.vel.x = ig.game.randomNumGen(this.speed-2,this.speed+6);
      this.vel.y = ig.game.randomNumGen(this.speed-2,this.speed+6);
    },

    update: function() {
    
      if( !(this.spawnerTimer==null) && this.spawnerTimer.delta() > this.spawnerDelay ) {
        //this.invincible = false;
        //this.currentAnim.alpha = 1;
        var dist = Math.floor((Math.random()*20)+10);
        // ig.game.spawnEntity(EntityZombie, this.pos.x, this.pos.y+dist, 
        //   {flip:!this.flip,spawnerDelay:this.spawnerDelay+1} );
        
        this.spawnerTimer=null;

      }
      
      // near an edge? return!
      var x_coord = 4; //4 = 8-4
      /*
      if(this.flip)
      {
        x_coord = 4;
      }else{
        x_coord = this.size.x − 4;
      }
      */// end comment blocl from line 35
      if( ig.game.collisionMap.getTile(
        this.pos.x + x_coord,
        this.pos.y + this.size.y+1
        )
      ) {
      this.flip = !this.flip;
      }
      //var xdir = this.flip ? −1 : 1;
      if(this.flip)
      {
        var xdir = -1;
      }else{
        var xdir = 1;
      }
      this.vel.x += (xdir*this.speed - this.vel.x)*0.9;
      this.vel.y += (this.speed - this.vel.y)*0.9;
      // this.vel.x = this.speed * xdir;
      // this.vel.x = (xdir*this.speed,3+Math.pow(this.vel.x))/4;
      // this.vel.y = (this.speed,3+Math.pow(this.vel.y))/4;
      this.currentAnim.flip.x = this.flip;
      this.parent();
    },
    
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      // collision with a wall? return!
      if( res.collision.x ) {
        this.flip = !this.flip;
      }
    },
    
    check: function( other ) {
      other.receiveDamage( 6, this );

      // this.vel.x += (this.pos.x - other.pos.x)*0.2;
      // this.vel.y += (this.pos.y - other.pos.y)*0.2;
      // other.vel.x *= (-100);
      // other.vel.y *= (-100);
      // this.vel.x *= (-200);
      // this.vel.y *= (-200);
    },
    
    receiveDamage: function(value){
      this.parent(value);
      if(this.health > 0)
        ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1,checkAgainst: ig.Entity.TYPE.A});
    },
    
    kill: function(){
      this.parent();
      ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, {colorOffset: 1,checkAgainst: ig.Entity.TYPE.A});
      ig.game.stats.kills++;
    }
    
  });

  EntityTurret = ig.Entity.extend({
    size: {x: 29, y: 37},
    animSheet: new ig.AnimationSheet( 'media/turret_1.png', 29, 37 ),
    //offset:{x:9,y:5},
    shift:{x:6,y:-1},
    //maxVel: {x: 200, y: 0},
    type: ig.Entity.TYPE.NONE,
    angle:0,
    //checkAgainst: ig.Entity.TYPE.B,
    //collides: ig.Entity.COLLIDES.PASSIVE,
    
    
    
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
      //this.vel.x = this.accel.x = velsetting;
      this.addAnim( 'idle', 0.2, [0] );
    },
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      
    },
    
    update: function(){
      
      
      this.pos.x = this.par.pos.x + this.shift.x;
      this.pos.y = this.par.pos.y + this.shift.y;
      //ig.log( 'tur x pos', this.pos.x,' tur par x',this.par.pos.x  );
      
      var mx = (ig.input.mouse.x + ig.game.screen.x); //Figures out the x coord of the mouse in the entire world
      var my = (ig.input.mouse.y + ig.game.screen.y); //Figures out the y coord of the mouse in the entire world  
      
      var px =this.pos.x + this.size.x/2;
      var py = this.pos.y + this.size.y/2;
      
      var r = Math.atan2(my-py, mx-px);
      
      
      //this.currentAnim = this.anims.run;
      this.angle = r;
      r = r + Math.PI/2;
      this.currentAnim.angle = r;
      
      
      this.parent();
    },

    check: function( other ) {
      //other.receiveDamage( 3, this );
      //this.kill();
    },
    
  });   //end of bullet
  
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
    
  });   //end of bullet
  
  
  EntityMouseBullet = ig.Entity.extend({
    size: {x: 5, y: 3},
    animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
    maxVel: {x: 0, y: 0},
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,
    
    desiredVel: 300,
    
    
    init: function( x, y, settings ) {
    
      //this.angle++;
      // ig.log( 'angle', settings.angle );
      //settings.angle = settings.angle/1000; // //
      
      this.maxVel.x = this.maxVel.y = this.desiredVel;
      
      var vely = Math.sin(settings.angle) * this.desiredVel; //.desiredVel is just the velocity I would want if we were going in a straight line directly out of the right of the player. I just put it as a property of the entity since I refer to it in multiple locations
      var velx =  Math.cos(settings.angle) * this.desiredVel;
       /*
       I'm a fan of fullspeed projectiles with no acceleration so we set the velocity, max velocity and for good measure acceleration too.
       You might want to start with a bit of velocity and some sort of acceleration so your projectile starts off slower and speeds up for something like a rocket 
       If that's the case, you'll want to do something like the following
       this.maxVel.x = whatever max you want;
       this.accel.x = Math.sin(this.angle)  * desiredAcceleration;
       this.accel.y = Math.cos(this.angle)  * desiredAcceleration;
       this.vel.x = Math.sin(this.angle)  * desiredStartingVelocity;
       this.vel.y = Math.cos(this.angle)  * desiredStartingVelocity;
       */
      //this.maxVel.x = this.vel.x = this.accel.x = velx;
      //this.maxVel.y = this.vel.y = this.accel.y = vely;
    
    
      this.parent( x  , y+8, settings );
      this.vel.x = this.accel.x = velx;
      this.vel.y = this.accel.y = vely;
      
      this.addAnim( 'idle', 0.2, [0] );
    },
    
    
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      if( res.collision.x || res.collision.y ){
        this.kill();
      }
    },

    check: function( other ) {
      other.receiveDamage( 1, this );
      other.vel.x += this.vel.x/10;
      other.vel.y += this.vel.y/10;
      this.kill();
    },
    kill: function(){
      
      this.parent();
      ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, 
        {callBack:this.onDeath} );
    },
    
  });   //end of bullet
  
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
    lifetime: 3,
    fadetime: 2,
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
  
  
  
  
  
  
  
  
  EntityDamageExplosion = ig.Entity.extend({
    
    callBack: null,
    particles: 25,
    
    checkAgainst: ig.Entity.TYPE.BOTH,
    
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
        ig.game.spawnEntity(EntityDamageExplosionParticle, x, y, {colorOffset: offsetColor,checkAgainst:this.checkAgainst});
      
    },
    update: function() {
    
      this.kill();
      
    },
    
  });
  
  
  EntityDamageExplosionParticle = ig.Entity.extend({
    size: {x: 2, y: 2},
    maxVel: {x: 160, y: 200},
    lifetime: 3,
    fadetime: 2,
    bounciness: 1,
    vel: {x: 100, y: 100},
    friction: {x:50, y: 50},
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
    },
    check: function( other ) {
      other.receiveDamage( 1, this );
      other.vel.x += this.vel.x/100;
      other.vel.y += this.vel.y/100;
      this.kill();
    },
  });

});

/*
ig.module(
  'game.entities.zombie'
)
.requires(
  'impact.entity'
)
.defines(function(){
  EntityZombie = ig.Entity.extend({
    animSheet: new ig.AnimationSheet( 'media/zombie.png', 16, 16 ),
    size: {x: 8, y:14},
    offset: {x: 4, y: 2},
    maxVel: {x: 100, y: 100},
    flip: false,
    lookAhead: 4,
    
    friction: {x: 150, y: 0},
    speed: 14,
    
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,
    
    
    
    init: function( x, y, settings ) {
      
      this.addAnim('walk', .07, [0,1,2,3,4,5]);
      this.parent( x, y, settings );
    },

    update: function() {
      // near an edge? return!
      var x_coord = 4; //4 = 8-4
      /*
      if(this.flip)
      {
        x_coord = 4;
      }else{
        x_coord = this.size.x − 4;
      }
      // end comment blocl from line 35
      if( !ig.game.collisionMap.getTile(
        this.pos.x + x_coord,
        this.pos.y + this.size.y+1
        )
      ) {
      this.flip = !this.flip;
      }
      //var xdir = this.flip ? −1 : 1;
      if(this.flip)
      {
        var xdir = -1;
      }else{
        var xdir = 1;
      }
      this.vel.x = this.speed * xdir;
      this.currentAnim.flip.x = this.flip;
      this.parent();
    },
    
    
    handleMovementTrace: function( res ) {
      this.parent( res );
      // collision with a wall? return!
      if( res.collision.x ) {
        this.flip = !this.flip;
      }
    },
    
    check: function( other ) {
    other.receiveDamage( 10, this );
    },
    
    receiveDamage: function(value){
    this.parent(value);
    if(this.health > 0)
      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1});
    },
    
    kill: function(){
      this.parent();
      ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {colorOffset: 1});
      ig.game.stats.kills++;
    }

  });
});
*/