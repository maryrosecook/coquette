;(function(exports) {
  var Player = function(settings) {
    settings = settings || {};
    this.pos = settings.pos;
    this.vel = { x:0, y:0 }; // bullshit
    this.pathInset = game.renderer.width / 2;
    this.pathRadius = game.renderer.width / 2 - 100;

    var angle;
    this.angle = function(newValue) {
      if (newValue !== undefined) {
        angle = newValue;
        var rAngle = game.maths.degToRad(angle);
        this.pos.x = this.pathInset + Math.sin(rAngle) * this.pathRadius;
        this.pos.y = this.pathInset + Math.cos(rAngle) * this.pathRadius;
      } else {
        return angle;
      }
    };

    this.angle(0);

    game.updater.add(this);
  };

  Player.prototype = {
    size: { x:1, y:1 },
    zIndex: 2,

	  update: function() {
      if (game.state !== game.STATE.PLAYING) return;
      this.handleKeyboard();
      this.draw();
	  },

    collision: function(other) {
      if (other instanceof Asteroid) {
        this.kill();
      }
    },

    draw: function() {
      if (game.state !== game.STATE.PLAYING) return;

      var ctx = game.renderer.ctx;

      // path circle
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      ctx.beginPath();
      var center = game.renderer.center();
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

    SHOOT_DELAY: 300,
    lastShot: 0,
    shootBullet: function(direction) {
      if(game.maths.timePassed(this.lastShot, this.SHOOT_DELAY)) {
        var center = game.maths.center(this);
        var v = game.maths.vectorTo(center, game.renderer.center());
        v.x *= 0.7;
        v.y *= 0.7;
        game.entityer.add(Bullet, {
          pos: { x:center.x, y:center.y },
          vector: v,
          owner: this,
        });

        this.lastShot = new Date().getTime();
      }
    },

    move: function(direction) {
      var angleChange = 4 * (direction === "left" ? -1 : 1);
      this.angle(game.maths.dial(this.angle(), angleChange, 359));
    },

    handleKeyboard: function() {
	    if(game.inputter.state(Inputter.LEFT_ARROW)) {
        this.move("left");
	    }

      if(game.inputter.state(Inputter.RIGHT_ARROW)) {
        this.move("right");
	    }

	    if(game.inputter.state(Inputter.SPACE)) {
        this.shootBullet();
      }
    },

    kill: function(respawnDelay) {
      if (respawnDelay === undefined) {
        respawnDelay = 2000;
      }

      game.entityer.remove(this);
      setTimeout(function() {
        game.entityer.add(Player, { pos: { x:0, y:0 }});
      }, respawnDelay);
    }
  };

  exports.Player = Player;
})(this);
