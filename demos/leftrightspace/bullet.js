;(function(exports) {
  var Bullet = function(game, settings) {
    this.game = game;
    this.boundingBox = game.c.collider.CIRCLE;
    this.center = settings.center;
    this.vel = settings.vector;
  };

  Bullet.prototype = {
    size: { x:1, y:1 },
    speed: 1000,

    update: function(tick) {
      if (this.game.state !== this.game.STATE.PLAYING) return;

      var mx = this.vel.x * tick;
      var my = this.vel.y * tick;
      this.center.x += mx;
      this.center.y += my;

      if (!this.game.c.renderer.onScreen(this)) {
        this.kill();
      }
    },

    draw: function(ctx) {
      if (this.game.state !== this.game.STATE.PLAYING) return;

      this.game.startClip(ctx);
      this.game.circle(this.center, this.size.x / 2, "#fff");
      this.game.endClip(ctx);
    },

    collision: function(other) {
      if (other instanceof Asteroid) {
        this.kill();
      }
    },

    kill: function() {
      this.game.c.entities.destroy(this);
    }
  };

  exports.Bullet = Bullet;
})(this);
