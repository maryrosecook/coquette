;(function(exports) {
  var Renderer = function(coquette, game, canvas, wView, hView, backgroundColor) {
    this.coquette = coquette;
    this.game = game;
    canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
    canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
    this.ctx = canvas.getContext('2d');
    this.backgroundColor = backgroundColor;

    canvas.width = wView;
    canvas.height = hView;
    this.viewSize = { x:wView, y:hView };
    this.worldSize = { x:wView, y:hView };
  };

  Renderer.prototype = {
    getCtx: function() {
      return this.ctx;
    },

    setWorldSize: function(size) {
      this.world = { x:size.x, y:size.y };
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
        x: this.worldSize.x / 2,
        y: this.worldSize.y / 2
      };
    },

    onScreen: function(obj) {
      return obj.pos.x >= this.viewCenter.x - this.viewSize.x / 2 &&
        obj.pos.x <= this.viewCenter.x + this.viewSize.x / 2 &&
        obj.pos.y >= this.viewCenter.y - this.viewSize.y / 2 &&
        obj.pos.y <= this.viewCenter.y + this.viewSize.y / 2;
    }
  };

    }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);
