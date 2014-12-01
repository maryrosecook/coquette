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
      if (this.getCollidingAsteroidGroup().length === 0) {
        color = "#666";
      }
      this.game.circle(this.center, this.size.x / 2, color);

      this.game.endClip(ctx);
    },

    collision: function(other) {
      if (other instanceof Bullet) {
        var collidingAsteroids = this.getCollidingAsteroidGroup();
        if (collidingAsteroids.length === 0) {
          this.spawnTwin(other);
        } else if (collidingAsteroids.length > 0) {
          for (var i = 0, len = collidingAsteroids.length; i < len; i++) {
            this.game.c.entities.destroy(collidingAsteroids[i]);
          }

          this.game.c.entities.destroy(this);
        }
      } else if (other instanceof Player) {
        this.spawnTwin(other);
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

    getCollidingAsteroidGroup: function() {
      var asteroids = this.game.c.entities.all()
          .filter(function(e) { return e instanceof Asteroid; });
      return getCollidingGroup(this, asteroids);
    }
  };

  function getCollidingGroup(entity, allEntities, group) {
    if (group === undefined) { return getCollidingGroup(entity, allEntities, []); }

    var next = allEntities
        .filter(function(e) { return Coquette.Collider.prototype.isColliding(entity, e); });
    for (var i = 0; i < next.length; i++) {
      if (group.indexOf(next[i]) === -1) {
        group.push(next[i]);
        getCollidingGroup(next[i], allEntities, group);
      }
    }

    return group;
  };

  exports.Asteroid = Asteroid;
})(this);
