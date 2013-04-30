;(function(exports) {
  var Bullet = function(settings) {
    this.pos = settings.pos;
    this.vel = settings.vector;
  };

  Bullet.prototype = {
	  size: { x:1, y:1 },
    speed: 1000,
    zIndex: 1,

    update: function() {
      if (game.state !== game.STATE.PLAYING) return;

		  var mx = this.vel.x * game.updater.tick;
		  var my = this.vel.y * game.updater.tick;
      this.pos.x += mx;
      this.pos.y += my;

      if (!game.renderer.onScreen(this)) {
        this.kill();
      }

      this.draw();
    },

    draw: function() {
      if (game.state !== game.STATE.PLAYING) return;

      game.renderer.startClip();
      game.renderer.circle(this.pos, this.size.x / 2, "#fff");
      game.renderer.endClip();
    },

    collision: function(other) {
      if (other instanceof Asteroid) {
        this.kill();
      }
    },

    kill: function() {
      game.entityer.remove(this);
    }
  };

  exports.Bullet = Bullet;
})(this);
