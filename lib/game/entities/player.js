ig.module(
  'game.entities.player'
).requires(
  'impact.entity',
  'game.entities.bullet'
).defines(function(){
  EntityPlayer = ig.Entity.extend({
    size: { x:1, y:1 },
    zIndex: 2,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.pathInset = ig.system.width / 2;
      this.pathRadius = ig.system.width / 2 - 100;

      if(ig.editor === undefined) {
        var angle;
        this.angle = function(newValue) {
          if (newValue !== undefined) {
            angle = newValue;
            var rAngle = ig.maths.degToRad(angle);
            // this.currentAnim.angle = -rAngle;
            this.pos.x = this.pathInset + Math.sin(rAngle) * this.pathRadius;
            this.pos.y = this.pathInset + Math.cos(rAngle) * this.pathRadius;
          } else {
            return angle;
          }
        };

        this.angle(0);
      }
    },

	  update: function() {
      if (ig.game.state !== ig.game.STATE.PLAYING) return;
      this.handleKeyboard();
	    this.parent(); // move
	  },

    collision: function(other) {
      if (other instanceof EntityAsteroid) {
        this.kill();
      }
    },

    draw: function() {
      if (ig.game.state !== ig.game.STATE.PLAYING) return;

      var ctx = ig.system.context;

      // path circle
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      ctx.beginPath();
      var center = ig.system.center();
      ctx.arc(center.x + this.size.x / 2, center.y + this.size.x / 2,
              this.pathRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();

      // current pos
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.pos.x + this.size.x / 2,
              this.pos.y + this.size.y / 2,
              this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    },

    SHOOT_DELAY: 50,
    lastShot: 0,
    shootBullet: function(direction) {
      if(ig.maths.timePassed(this.lastShot, this.SHOOT_DELAY)) {
        var center = ig.maths.center(this);
        var v = ig.maths.vectorTo(center, ig.system.center());
        v.x *= 1000;
        v.y *= 1000;
	      ig.game.spawnEntity(EntityBullet, center.x, center.y, {
          vector: v,
          owner: this,
        });

        this.lastShot = new Date().getTime();
        // ig.sounder.play("gunshotSound");
      }
    },

    move: function(direction) {
      var angleChange = 4 * (direction === "left" ? -1 : 1);
      this.angle(ig.maths.dial(this.angle(), angleChange, 359));
    },

    handleKeyboard: function() {
	    if(ig.input.state("left")) {
        this.move("left");
	    } else if(ig.input.state("right")) {
        this.move("right");
	    }

	    if(ig.input.pressed('shoot')) {
        this.shootBullet();
      }
    },

    kill: function(respawnDelay) {
      this.parent();
      if (respawnDelay === undefined) {
        respawnDelay = 2000;
      }
      setTimeout(function() {
        ig.game.player = ig.game.spawnEntity(EntityPlayer, 0, 0, {});
      }, respawnDelay);
    }
  });
});
