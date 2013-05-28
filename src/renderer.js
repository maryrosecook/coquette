;(function(exports) {
  var Renderer = function(coquette, game, canvas, width, height, backgroundColor) {
    this.coquette = coquette;
    this.game = game;
    canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
    canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
    this.ctx = canvas.getContext('2d');
    this.backgroundColor = backgroundColor;
    canvas.width = this.width = width;
    canvas.height = this.height = height;
  };

  Renderer.prototype = {
    getCtx: function() {
      return this.ctx;
    },

    update: function(interval) {
      var ctx = this.getCtx();

      // draw background
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, this.width, this.height);

      // draw game and entities
      var drawables = [this.game].concat(this.coquette.entities.all());
      for (var i = 0, len = drawables.length; i < len; i++) {
        if (drawables[i].draw !== undefined) {
          drawables[i].draw(ctx);
        }
      }
    },

    center: function() {
      return {
        x: this.width / 2,
        y: this.height / 2
      };
    },

    onScreen: function(obj) {
      return obj.pos.x > 0 && obj.pos.x < this.coquette.renderer.width &&
        obj.pos.y > 0 && obj.pos.y < this.coquette.renderer.height;
    }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);
