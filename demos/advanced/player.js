;(function(exports) {
  var Player = function(game, settings) {
    this.game = game;
    this.boundingBox = game.coquette.collider.CIRCLE;
    this.center = settings.center;
    this.vel = { x:0, y:0 }; // bullshit
    this.pathInset = this.game.coquette.renderer.getViewSize().x / 2;
    this.pathRadius = this.game.coquette.renderer.getViewSize().x / 2 - 100;

    var angle;
    this.circleAngle = function(newValue) {
      if (newValue !== undefined) {
        angle = newValue;
        var rAngle = this.game.maths.degToRad(angle);
        this.center.x = this.pathInset + Math.sin(rAngle) * this.pathRadius;
        this.center.y = this.pathInset + Math.cos(rAngle) * this.pathRadius;
      } else {
        return angle;
      }
    };

    this.circleAngle(0);
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
      this.game.circle(this.center, this.size.x / 2, "#222");
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1;
      ctx.beginPath();
      var center = this.game.coquette.renderer.getViewCenter();
      ctx.arc(center.x, center.y,
              this.pathRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();

      // current position
      ctx.strokeStyle = "#fff";
      ctx.fillStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.center.x,
              this.center.y,
              this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    },

    shootBullet: function(direction) {
      var v = this.game.maths.vectorTo(this.center,
                                       this.game.coquette.renderer.getViewCenter());
      v.x *= 0.7;
      v.y *= 0.7;
      this.game.coquette.entities.create(Bullet, {
        center: { x: this.center.x, y: this.center.y },
        vector: v,
        owner: this,
      });

      // spawn new asteroid

      var rAngle = this.game.maths.degToRad(this.circleAngle());
      var center = {
        x: this.game.coquette.renderer.getViewSize().x / 2 + Math.sin(rAngle) * 250,
        y: this.game.coquette.renderer.getViewSize().y / 2 + Math.cos(rAngle) * 250
      };

      var vel = this.game.maths.vectorTo(
        this.game.coquette.renderer.getViewCenter(), center);
      vel.x /= 10;
      vel.y /= 10;

      this.game.coquette.entities.create(Asteroid, { center: center, vel: vel });
    },

    move: function(direction) {
      var angleChange = 4 * (direction === "left" ? -1 : 1);
      this.circleAngle(this.game.maths.dial(this.circleAngle(), angleChange, 359));
    },

    handleKeyboard: function() {
      if(this.game.coquette.inputter.isDown(this.game.coquette.inputter.LEFT_ARROW)) {
        this.move("left");
      }

      if(this.game.coquette.inputter.isDown(this.game.coquette.inputter.RIGHT_ARROW)) {
        this.move("right");
      }

      if(this.game.coquette.inputter.isPressed(this.game.coquette.inputter.SPACE)) {
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
          center: { x:0, y:0 }
        }, function(player) {
          self.game.player = player;
        });
      }, respawnDelay);
    }
  };

  exports.Player = Player;
})(this);
