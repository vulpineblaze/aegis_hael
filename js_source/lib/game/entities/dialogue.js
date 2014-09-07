ig.module(
    'game.entities.dialogue'
)
.requires(
    'impact.entity'
)
.defines(function(){
EntityDialogue = ig.Entity.extend({
    size: {x:0, y:0},
    // pos:{x:ig.system.width/4,y:ig.system.width/4},
    zIndex:800, //
    ignorePause: true,
    //animSheet: new ig.AnimationSheet( 'media/hud.png', 320, 20 ),
    buttonImage: new ig.Image( 'media/button.png',48,48 ),

    collides: ig.Entity.COLLIDES.NEVER,
    gravityFactor: 0,

    showText: "",
    hasOK:true,
    hasCancel:false,
    hasYes:false,
    hasNo:false,

    canResume: false,

    init: function( x, y, settings ) {
        //this.addAnim( 'idle', 1, [0] );
        this.parent( x, y, settings );
        this.pos.x=ig.game.screen.x+ig.system.width/4;
        this.pos.y=ig.game.screen.y+ig.system.height/4;
        this.size.x=ig.system.width/2;
        this.size.y=ig.system.height/2;

        this.pos.x *= ig.system.scale;
        this.pos.y *= ig.system.scale;
        this.size.x *= ig.system.scale;
        this.size.y *= ig.system.scale; //

        if(settings.showText){
          this.showText = settings.showText;
        }


    },
    update: function(){
        // this.pos.x=ig.game.screen.x;
        // this.pos.y=ig.game.screen.y;
        if (ig.input.pressed('lbtn') ){

            ig.game.sortEntitiesDeferred();
            this.checkForButtonClicked();
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
        var offset = 1;
        var ctx = ig.system.context;

        buttonY = this.pos.y + this.size.y / 8;

        buttonTextY = buttonY + this.buttonImage.height/2.6;


        ctx.fillStyle = "rgba(100,100,120,0.6)"; //
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        // console.log(this.showText);
        if(this.hasOK){
          this.buttonImage.draw(this.pos.x + this.buttonImage.width,
                buttonY);
          ig.game.font.draw("OK",
            this.pos.x + this.buttonImage.height*1.5,
            buttonTextY, //
            ig.Font.ALIGN.CENTER ); 
        }
        if(this.hasCancel){
          this.buttonImage.draw(this.pos.x,
                buttonY);
          ig.game.font.draw("Cancel",
            this.pos.x + this.buttonImage.height*0.5,
            buttonTextY, //
            ig.Font.ALIGN.CENTER ); 
        }
        if(this.hasYes){
          this.buttonImage.draw(this.pos.x - this.buttonImage.width*2,
                buttonY);
          ig.game.font.draw("No",
            this.pos.x - this.buttonImage.height*0.5,
            buttonTextY, //
            ig.Font.ALIGN.CENTER ); 
        }
        if(this.hasNo){
          this.buttonImage.draw(this.pos.x - this.buttonImage.width,
                buttonY);
          ig.game.font.draw("Yes",
            this.pos.x - this.buttonImage.height*1.5,
            buttonTextY, //
            ig.Font.ALIGN.CENTER ); 
        }

        ig.game.font.draw(this.showText,
            this.pos.x,
            this.pos.y - (this.size.y/8), 
            ig.Font.ALIGN.CENTER ); 

        

        this.parent();

 
    },

    checkForButtonClicked: function(){
      var clickedInButton = false;
      if(ig.input.mouse.y>= this.pos.y + this.size.y / 8 + this.buttonImage.height*0.25 &&
         ig.input.mouse.y<= this.pos.y + this.size.y / 8 + this.buttonImage.height*0.75  ){
        // alert('in button box Y');
        if(ig.input.mouse.x>= this.pos.x + this.buttonImage.width*0.1 &&
            ig.input.mouse.x<= this.pos.x + this.buttonImage.width*0.9  ){
          // alert('in button box Cancel');
          clickedInButton = true;
          ig.game.pauseReturn = "Cancel";
        }
        if(ig.input.mouse.x>= this.pos.x + this.buttonImage.width*1.1 &&
            ig.input.mouse.x<= this.pos.x + this.buttonImage.width*1.9  ){
          // alert('in button box OK');
          clickedInButton = true;
          ig.game.pauseReturn = "OK";
        }
        if(ig.input.mouse.x<= this.pos.x - this.buttonImage.width*0.1 &&
            ig.input.mouse.x>= this.pos.x - this.buttonImage.width*0.9  ){
          // alert('in button box No');
          clickedInButton = true;
          ig.game.pauseReturn = "No";
        }
        if(ig.input.mouse.x<= this.pos.x - this.buttonImage.width*1.1 &&
            ig.input.mouse.x>= this.pos.x - this.buttonImage.width*1.9  ){
          // alert('in button box Yes');
          clickedInButton = true;
          ig.game.pauseReturn = "Yes";
        }
      }

      if(clickedInButton){
        if(ig.game.pauseText){
          ig.game.togglePause();
        }
      }
    } // end fo checkinbutton clciked

});
});