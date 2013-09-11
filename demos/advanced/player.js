;(function(exports) {
  var Player = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.vel = { x:0, y:0 }; // bullshit
    this.pathInset = this.game.coquette.renderer.getViewSize().x / 2;
    this.pathRadius = this.game.coquette.renderer.getViewSize().x / 2 - 100;

    var angle;
    this.angle = function(newValue) {
      if (newValue !== undefined) {
        angle = newValue;
        var rAngle = this.game.maths.degToRad(angle);
        this.pos.x = this.pathInset + Math.sin(rAngle) * this.pathRadius;
        this.pos.y = this.pathInset + Math.cos(rAngle) * this.pathRadius;
      } else {
        return angle;
      }
    };

    this.angle(0);
  };

  Player.prototype = {
    size: { x:1, y:1 },

    update: function() {
      if (this.game.state !== this.game.STATE.PLAYING) return;
      this.handleKeyboard();
    },

    collision: function(other) {
      if (other instanceof Asteroid) {
        this.kill();
      }
    },

    draw: function(ctx) {
      if (this.game.state !== this.game.STATE.PLAYING) return;
      // path circle
      this.game.circle(this.pos, this.size.x / 2, "#222");
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      ctx.beginPath();
      var center = this.game.coquette.renderer.getViewCenterPos();
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

    shootBullet: function(direction) {
      var center = this.game.maths.center(this);
      var v = this.game.maths.vectorTo(center,
                                       this.game.coquette.renderer.getViewCenterPos());
      v.x *= 0.7;
      v.y *= 0.7;
      this.game.coquette.entities.create(Bullet, {
        pos: { x:center.x, y:center.y },
        vector: v,
        owner: this,
      });

      // spawn new asteroid

      var rAngle = this.game.maths.degToRad(this.angle());
      var pos = {
        x: this.game.coquette.renderer.getViewSize().x / 2 - 30 + Math.sin(rAngle) * 250,
        y: this.game.coquette.renderer.getViewSize().y / 2 - 30 + Math.cos(rAngle) * 250
      };

      var vel = this.game.maths.normalise(this.game.maths.vectorTo(
        this.game.coquette.renderer.getViewCenterPos(), pos));
      vel.x /= 10;
      vel.y /= 10;

      this.game.coquette.entities.create(Asteroid, { pos: pos, vel: vel });
    },

    move: function(direction) {
      var angleChange = 4 * (direction === "left" ? -1 : 1);
      this.angle(this.game.maths.dial(this.angle(), angleChange, 359));
    },

    handleKeyboard: function() {
      if(this.game.coquette.inputter.down(this.game.coquette.inputter.LEFT_ARROW)) {
        this.move("left");
      }

      if(this.game.coquette.inputter.down(this.game.coquette.inputter.RIGHT_ARROW)) {
        this.move("right");
      }

      if(this.game.coquette.inputter.pressed(this.game.coquette.inputter.SPACE)) {
        this.shootBullet();
      }
    },

    kill: function(respawnDelay) {
      if (respawnDelay === undefined) {
        respawnDelay = 2000;
      }

      this.game.coquette.entities.destroy(this);
      var self = this;
      setTimeout(function() {
        self.game.coquette.entities.create(Player, {
          pos: { x:0, y:0 }
        }, function(player) {
          self.game.player = player;
        });
      }, respawnDelay);
    }
  };

  exports.Player = Player;
})(this);
