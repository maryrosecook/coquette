;(function(exports) {
  var Asteroid = function(game, settings) {
    this.game = game;
    this.center = settings.center;
    this.boundingBox = this.game.c.collider.CIRCLE;

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
      this.center.x += mx;
      this.center.y += my;

      this.wrap();
    },

    wrap: function() {
      if (this.game.maths.distance(this.center,
                                   this.game.c.renderer.getViewCenter()) >
          (this.game.c.renderer.getViewSize().x / 2 + this.size.x) + 100) {
        if (this.center.x < 0) {
          this.center.x = this.game.c.renderer.getViewSize().x;
        } else if (this.center.x > this.game.c.renderer.getViewSize().x) {
          this.center.x = -this.size.x;
        } else if (this.center.y < 0) {
          this.center.y = this.game.c.renderer.getViewSize().y + 1;
        } else if (this.center.y > this.game.c.renderer.getViewSize().y) {
          this.center.y = 0;
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
      this.game.circle(this.center, this.size.x / 2, color);

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
      this.game.c.entities.destroy(this);
    },

    collision: function(other, type) {
      if (type === this.game.c.collider.INITIAL) {
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
      this.game.c.entities.create(Asteroid, {
        center: { x:this.center.x, y:this.center.y },
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
