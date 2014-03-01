;(function(exports) {
  var particleSize = { x: 1.5, y: 1.5 };

  exports.Particle = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.body = game.physics.createSingleShapeBody(this, {
      shape: "circle",
      center: settings.center,
      size: particleSize,
      bullet: settings.bullet || false,
      restitution: settings.restitution || 0.5,
      density: settings.density || 1,
    });

    this.maxLife = settings.maxLife;
    this.dangerous = settings.dangerous || false;
    this.color = settings.color;
    this.draw = settings.stroke === true ? drawStroke : drawFill;

    this.birth = new Date().getTime();

    settings.pusher.call(this);
    andro.augment(this, destroy);
  };

  exports.Particle.prototype = {
    update: function() {
      this.body.update();
      this.body.drag(0.00005);

      if (Maths.magnitude(this.vec) < 0.001) {
        this.destroy();
        this.game.particleGhosts.push({
          // size hardcoded when drawn
          center: this.center,
          color: this.color
        });
      }
    },

    collision: function(other, type) {
      if (this.dangerous) {
        if (type === "add" && other instanceof Isla) {
          other.receiveDamage(3);
          this.destroy();
        } else if (type === "add" && other instanceof Mary) {
          this.destroy();
        }
      }
    }
  };

  var drawStroke = function() {
    this.game.drawer.circle(this.center, this.size.x / 2, this.color);
  };

  var drawFill = function() {
    this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.color);
  };
})(this);
