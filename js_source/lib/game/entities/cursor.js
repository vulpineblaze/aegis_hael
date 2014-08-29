ig.module(
    'game.entities.cursor'
)
.requires(
  'impact.entity',
  'game.imageblender'
)
.defines(function(){
EntityCursor = ig.Entity.extend({
  size: {x: 20, y: 20},
  zIndex:800, //
  //animSheet: new ig.AnimationSheet( 'media/hud.png', 320, 20 ),
  // collides: ig.Entity.COLLIDES.NEVER,
  checkAgainst: ig.Entity.TYPE.BOTH,
  type: ig.Entity.TYPE.A,


  collides: ig.Entity.COLLIDES.PASSIVE,
  gravityFactor: 0,
  animSheet: new ig.AnimationSheet( 'media/null_towers.png#00FF00', 24, 24 ),
  redAnimSheet: new ig.AnimationSheet( 'media/null_towers.png#FF0000', 24, 24 ),

  cursorSpriteOffset: {x:-3,y:-3},

  isTouching: false,


  init: function( x, y, settings ) {
    //this.addAnim( 'idle', 1, [0] ); //
    this.parent( x, y, settings );
    this.pos.x=ig.input.mouse.x;
    this.pos.y=ig.input.mouse.y;
    this.addAnim( 'idle', 1, [0] );
    this.addAnim( 'first', 1, [1] );
    this.addAnim( 'second', 1, [2] );
    this.addAnim( 'third', 1, [3] );
    this.addAnim( 'fourth', 1, [4] );
    this.addAnim( 'fifth', 1, [5] );
    this.addAnim( 'sixth', 1, [6] );
    this.addAnim( 'seventh', 1, [7] );
    this.addAnim( 'eigth', 1, [8] );
    this.addAnim( 'ninth', 1, [9] );

    this.currentAnim = this.anims.idle;
  },

  update: function(){
    this.pos.x=ig.input.mouse.x+ig.game.screen.x+this.cursorSpriteOffset.x;
    this.pos.y=ig.input.mouse.y+ig.game.screen.y+this.cursorSpriteOffset.y; //
    if (ig.input.pressed('lbtn') ){

        // ig.game.sortEntitiesDeferred();
    }
    if(ig.input.mouse.y<=20)
    {
        //console.log('mouse zone');
    }
    else
    {
    
    }
    this.parent();
  },

  draw: function(){



    

    this.parent();


  },

  check: function(){
    // console.log("touching check");
    // var sheet1 = new ig.AnimationSheet( 'media/null_towers.png#FF0000', 24, 24  );
    this.anims.first = new ig.Animation( this.redAnimSheet, 1, [1] );
    this.anims.second = new ig.Animation( this.redAnimSheet, 1, [2] );
    this.anims.third = new ig.Animation( this.redAnimSheet, 1, [3] );
    this.anims.fourth = new ig.Animation( this.redAnimSheet, 1, [4] );
    this.anims.fifth = new ig.Animation( this.redAnimSheet, 1, [5] );
    this.anims.sixth = new ig.Animation( this.redAnimSheet, 1, [6] );
    this.anims.seventh = new ig.Animation( this.redAnimSheet, 1, [7] );
    this.anims.eigth = new ig.Animation( this.redAnimSheet, 1, [8] );
    this.anims.ninth = new ig.Animation( this.redAnimSheet, 1, [9] );
    this.isTouching = true;
  },

  handleMovementTrace: function( res ) {
    if( res.collision.x || res.collision.y ){
      // console.log("touching movement trace");
    }else{
      // console.log(" not touching movement trace");
      if(this.isTouching){
        this.anims.first = new ig.Animation( this.animSheet, 1, [1] ); //
        this.anims.first = new ig.Animation( this.animSheet, 1, [1] );
        this.anims.second = new ig.Animation( this.animSheet, 1, [2] );
        this.anims.third = new ig.Animation( this.animSheet, 1, [3] );
        this.anims.fourth = new ig.Animation( this.animSheet, 1, [4] );
        this.anims.fifth = new ig.Animation( this.animSheet, 1, [5] );
        this.anims.sixth = new ig.Animation( this.animSheet, 1, [6] );
        this.anims.seventh = new ig.Animation( this.animSheet, 1, [7] );
        this.anims.eigth = new ig.Animation( this.animSheet, 1, [8] );
        this.anims.ninth = new ig.Animation( this.animSheet, 1, [9] );
        this.isTouching = false;
      }
    }

    this.parent( res );
  },
  receiveDamage: function(amount, from){
      // if(this.invincible)
      // {
      //   return;
      // }else{
      //   this.invincibleDelay=0.3;
      //   this.makeInvincible();
      // }
      amount = 0;
      this.parent(amount, from);
    },

});
});