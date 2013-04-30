;(function(exports) {
  var Asteroid = function(settings) {
    this.pos = settings.pos;

    if (settings.radius === undefined) {
      this.size = { x: 60, y: 60 };
    } else {
      this.size = { x: settings.radius * 2, y: settings.radius * 2 };
    }

    if (settings.vel !== undefined) {
      this.vel = settings.vel;
    } else {
      this.vel = {
        x: 0.02 + Math.random() * 0.1 * game.maths.plusMinus(),
        y: 0.02 + Math.random() * 0.1 * game.maths.plusMinus()
      };
    }

    this.collidingAsteroids = [];
  };

  Asteroid.prototype = {
    zIndex: 0,
    destroyed: false,

	  update: function() {
      if (game.state !== game.STATE.PLAYING) return;
		  var mx = this.vel.x * game.updater.tick;
		  var my = this.vel.y * game.updater.tick;
      this.pos.x += mx;
      this.pos.y += my;

      this.wrap();

      this.draw();
	  },

    wrap: function() {
      if (game.maths.distance(game.maths.center(this), game.renderer.center()) >
          (game.renderer.width / 2 + this.size.x) + 100) {
        if (this.pos.x < 0) {
          this.pos.x = game.renderer.width;
          game.collider.removeEntity(this);
        } else if (this.pos.x > game.renderer.width) {
          this.pos.x = -this.size.x;
          game.collider.removeEntity(this);
        } else if (this.pos.y < 0) {
          this.pos.y = game.renderer.height + 1;
          game.collider.removeEntity(this);
        } else if (this.pos.y > game.renderer.height) {
          this.pos.y = 0;
          game.collider.removeEntity(this);
        }
      }
    },

    draw: function() {
      if (game.state !== game.STATE.PLAYING) return;
      var ctx = game.renderer.ctx;

      game.renderer.startClip();

      var color = "#fff";
      if (this.collidingAsteroids.length === 0) {
        color = "#666";
      }
      game.renderer.circle(this.pos, this.size.x / 2, color);

      game.renderer.endClip();
    },

    destroy: function(other) {
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
      game.entityer.remove(this);
    },

    collision: function(other) {
      if (other instanceof Bullet) {
        if (this.collidingAsteroids.length === 0) {
          Asteroid.spawnTwin(this, other);
        } else if (this.collidingAsteroids.length > 0) {
          game.runner.add(this, function(self) {
            self.destroy(other);
          });
        }
      } else if (other instanceof Player) {
        Asteroid.spawnTwin(this, other);
      } else if (other instanceof Asteroid) {
        this.collidingAsteroids.push(other);
      }
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

  Asteroid.spawnTwin = function(twin, other) {
    game.entityer.add(Asteroid, {
      pos: { x:twin.pos.x, y:twin.pos.y },
      radius: twin.size.x / 2,
      vel: {
        x: twin.vel.x + other.vel.x / 15 + Math.random() * 0.1,
        y: twin.vel.y + other.vel.y / 15 + Math.random() * 0.1,
      }
    });
  };

  Asteroid.spawnAfterShooting = function(player) {
    var rAngle = game.maths.degToRad(player.angle());
    var pos = {
      x: game.renderer.width / 2 - 30 + Math.sin(rAngle) * 250,
      y: game.renderer.height / 2 - 30 + Math.cos(rAngle) * 250
    };

    var vel = game.maths.normalise(game.maths.vectorTo(game.renderer.center(), pos));
    vel.x /= 10;
    vel.y /= 10;

    game.entityer.add(Asteroid, {
      pos: pos,
      vel: vel
    });
  };

  exports.Asteroid = Asteroid;
})(this);
