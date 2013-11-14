;(function(exports) {
  var Asteroid = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.boundingBox = this.game.coquette.collider.CIRCLE;

    if (settings.radius === undefined) {
      this.size = { x: 60, y: 60 };
    } else {
      this.size = { x: settings.radius * 2, y: settings.radius * 2 };
    }

    if (settings.vel !== undefined) {
      this.vel = settings.vel;
    } else {
      this.vel = {
        x: 0.02 + Math.random() * 0.1 * this.game.maths.plusMinus(),
        y: 0.02 + Math.random() * 0.1 * this.game.maths.plusMinus()
      };
    }

    this.collidingAsteroids = [];
  };

  Asteroid.prototype = {
    destroyed: false,

    update: function(tick) {
      if (this.game.state !== this.game.STATE.PLAYING) return;
      var mx = this.vel.x * tick;
      var my = this.vel.y * tick;
      this.pos.x += mx;
      this.pos.y += my;

      this.wrap();
    },

    wrap: function() {
      if (this.game.maths.distance(this.game.maths.center(this),
                                   this.game.coquette.renderer.getViewCenterPos()) >
          (this.game.coquette.renderer.getViewSize().x / 2 + this.size.x) + 100) {
        if (this.pos.x < 0) {
          this.pos.x = this.game.coquette.renderer.getViewSize().x;
        } else if (this.pos.x > this.game.coquette.renderer.getViewSize().x) {
          this.pos.x = -this.size.x;
        } else if (this.pos.y < 0) {
          this.pos.y = this.game.coquette.renderer.getViewSize().y + 1;
        } else if (this.pos.y > this.game.coquette.renderer.getViewSize().y) {
          this.pos.y = 0;
        }
      }
    },

    draw: function(ctx) {
      if (this.game.state !== this.game.STATE.PLAYING) return;

      this.game.startClip(ctx);

      var color = "#fff";
      if (this.collidingAsteroids.length === 0) {
        color = "#666";
      }
      this.game.circle(this.pos, this.size.x / 2, color);

      this.game.endClip(ctx);
    },

    destroy: function() {
      for (var i = 0, len = this.collidingAsteroids.length; i < len; i++) {
        if (this.collidingAsteroids[i] !== undefined) {
          if (this.collidingAsteroids[i].destroyed === false) {
            this.collidingAsteroids[i].destroyed = true;
            this.collidingAsteroids[i].destroy();
          }
        }
      }
      this.kill();
    },

    kill: function() {
      this.game.coquette.entities.destroy(this);
    },

    collision: function(other, type) {
      if (type === this.game.coquette.collider.INITIAL) {
        if (other instanceof Bullet) {
          if (this.collidingAsteroids.length === 0) {
            this.spawnTwin(other);
          } else if (this.collidingAsteroids.length > 0) {
            this.destroy();
          }
        } else if (other instanceof Player) {
          this.spawnTwin(other);
        } else if (other instanceof Asteroid) {
          this.collidingAsteroids.push(other);
        }
      }
    },

    spawnTwin: function(other) {
      this.game.coquette.entities.create(Asteroid, {
        pos: { x:this.pos.x, y:this.pos.y },
        radius: this.size.x / 2,
        vel: {
          x: this.vel.x + other.vel.x / 15 + Math.random() * 0.1,
          y: this.vel.y + other.vel.y / 15 + Math.random() * 0.1,
        }
      });
    },

    uncollision: function(other) {
      if (other instanceof Asteroid) {
        for (var i = 0, len = this.collidingAsteroids.length; i < len; i++) {
          if (this.collidingAsteroids[i] === other) {
            this.collidingAsteroids.splice(i, 1);
            break;
          }
        }
      }
    }
  };

  exports.Asteroid = Asteroid;
})(this);
