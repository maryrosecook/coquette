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

    spawn: function(other) {
      game.entityer.add(Asteroid, {
        pos: { x:this.pos.x, y:this.pos.y },
        radius: this.size.x / 2,
        vel: {
          x: this.vel.x + other.vel.x / 15 + Math.random() * 0.1,
          y: this.vel.y + other.vel.y / 15 + Math.random() * 0.1,
        }
      });
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
          this.spawn(other);
        } else if (this.collidingAsteroids.length > 0) {
          game.runner.add(this, function(self) {
            self.destroy(other);
          });
        }
      } else if (other instanceof Player) {
        this.spawn(other);
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

  // var getRandomPos = function() {
  //   var pos = {
  //     x: Math.random() * game.renderer.width * 3 - game.renderer.width,
  //     y: Math.random() * game.renderer.height * 3 - game.renderer.height
  //   };

  //   if (game.maths.distance(pos, game.renderer.center()) >
  //       game.renderer.width / 2) {
  //     return pos;
  //   } else {
  //     return getRandomPos();
  //   }
  // };

  exports.Asteroid = Asteroid;
})(this);
