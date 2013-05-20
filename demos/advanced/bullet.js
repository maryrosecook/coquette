;(function(exports) {
  var Bullet = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.vel = settings.vector;
  };

  Bullet.prototype = {
    size: { x:1, y:1 },
    speed: 1000,
    zIndex: 1,

    update: function() {
      if (this.game.state !== this.game.STATE.PLAYING) return;

      var mx = this.vel.x * this.game.coquette.updater.tick;
      var my = this.vel.y * this.game.coquette.updater.tick;
      this.pos.x += mx;
      this.pos.y += my;

      if (!this.game.coquette.renderer.onScreen(this)) {
        this.kill();
      }
    },

    draw: function(ctx) {
      if (this.game.state !== this.game.STATE.PLAYING) return;

      this.game.startClip(ctx);
      this.game.circle(this.pos, this.size.x / 2, "#fff");
      this.game.endClip(ctx);
    },

    collision: function(other) {
      if (other instanceof Asteroid) {
        this.kill();
      }
    },

    kill: function() {
      this.game.coquette.entities.destroy(this);
    }
  };

  exports.Bullet = Bullet;
})(this);
