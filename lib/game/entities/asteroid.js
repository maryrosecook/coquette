ig.module(
  'game.entities.asteroid'
).requires(
  'impact.entity'
).defines(function(){
  EntityAsteroid = ig.Entity.extend({
    zIndex: 0,
    destroyed: false,

    init: function(x, y, settings) {
      this.parent(x, y, settings);

      if (settings.radius === undefined) {
        this.size = { x: 60, y: 60 };
      } else {
        this.size = { x: settings.radius * 2, y: settings.radius * 2 };
      }

      if (settings.vel !== undefined) {
        this.vel = settings.vel;
      } else {
        this.vel = {
          x: 20 + Math.random() * 100 * this.plusMinus(),
          y: 20 + Math.random() * 100 * this.plusMinus()
        };
      }

      this.collidingAsteroids = [];
    },

    plusMinus: function() {
      return Math.random() < 0.5 ? -1 : 1;
    },

	  update: function() {
      if (ig.game.state !== ig.game.STATE.PLAYING) return;

	    this.parent(); // move
      this.wrap();
	  },

    wrap: function() {
      if (ig.maths.distance(ig.maths.center(this), ig.system.center()) >
          (ig.system.width / 2 + this.size.x) + 100) {
        if (this.pos.x < 0) {
          this.pos.x = ig.system.width;
          ig.collider.removeEntity(this);
        } else if (this.pos.x > ig.system.width) {
          this.pos.x = -this.size.x;
          ig.collider.removeEntity(this);
        } else if (this.pos.y < 0) {
          this.pos.y = ig.system.height + 1;
          ig.collider.removeEntity(this);
        } else if (this.pos.y > ig.system.height) {
          this.pos.y = 0;
          ig.collider.removeEntity(this);
        }
      }
    },

    draw: function() {
      if (ig.game.state !== ig.game.STATE.PLAYING) return;

      var ctx = ig.system.context;

      ig.game.startClip();

      if (this.collidingAsteroids.length === 0) {
        ctx.strokeStyle = "#666";
      } else {
        ctx.strokeStyle = "#fff";
      }

      ctx.beginPath();
      ctx.arc(this.pos.x + this.size.x / 2,
              this.pos.y + this.size.y / 2,
              this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();

      ig.game.endClip();
    },

    handleMovementTrace: function() {
		  var mx = this.vel.x * ig.system.tick;
		  var my = this.vel.y * ig.system.tick;
      this.pos.x += mx;
      this.pos.y += my;
    },

    spawn: function(other) {
      ig.runner.add(this, function(self) {
        newSpinoff(self, other);
        ig.game.sortEntities();
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

    collision: function(other) {
      if (other instanceof EntityBullet) {
        if (this.collidingAsteroids.length === 0) {
          this.spawn(other);
        } else if (this.collidingAsteroids.length > 0) {
          ig.runner.add(this, function(self) {
            self.destroy(other);
          });
        }
      } else if (other instanceof EntityPlayer) {
        this.spawn(other);
      } else if (other instanceof EntityAsteroid) {
        this.collidingAsteroids.push(other);
      }
    },

    uncollision: function(other) {
      if (other instanceof EntityAsteroid) {
        for (var i = 0, len = this.collidingAsteroids.length; i < len; i++) {
          if (this.collidingAsteroids[i] === other) {
            this.collidingAsteroids.splice(i, 1);
            break;
          }
        }
      }
    }
  });

  var newSpinoff = function(old, collider) {
    return ig.spawner.add(EntityAsteroid, {
      pos: { x:old.pos.x, y:old.pos.y },
      radius: old.size.x / 2,
      vel: {
        x: old.vel.x + collider.vel.x / 15 + Math.random() * 50,
        y: old.vel.y + collider.vel.y / 15 + Math.random() * 50,
      }
    });
  };

  EntityAsteroid.count = function() {
    return ig.game.getEntitiesByType(EntityAsteroid).length;
  };

  EntityAsteroid.getRandomPos = function() {
    var pos = {
      x: Math.random() * ig.system.width * 3 - ig.system.width,
      y: Math.random() * ig.system.height * 3 - ig.system.height
    };

    if (ig.maths.distance(pos, ig.system.center()) >
        ig.system.width / 2) {
      return pos;
    } else {
      return this.getRandomPos();
    }
  };
});
