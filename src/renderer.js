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
    this.viewCenterPos = { x: 0, y: 0 };
  };

  Renderer.prototype = {
    getCtx: function() {
      return this.ctx;
    },

    getViewSize: function() {
      return this.viewSize;
    },

    getViewCenterPos: function() {
      return this.viewCenterPos;
    },

    setViewCenterPos: function(pos) {
      this.viewCenterPos = { x:pos.x, y:pos.y };
    },

    update: function(interval) {
      var ctx = this.getCtx();

      // draw background
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(-this.viewSize.x / 2,
                   -this.viewSize.y / 2,
                   this.worldSize.x + this.viewSize.x / 2,
                   this.worldSize.y + this.viewSize.y / 2);

      var viewTranslate = viewOffset(this.viewCenterPos, this.viewSize);

      // translate so all objs placed relative to viewport
      ctx.translate(-viewTranslate.x, -viewTranslate.y);

      // draw game and entities
      var drawables = [this.game].concat(this.coquette.entities.all());
      for (var i = 0, len = drawables.length; i < len; i++) {
        if (drawables[i].draw !== undefined) {
          drawables[i].draw(ctx);
        }
      }

      // translate back
      ctx.translate(viewTranslate.x, viewTranslate.y);
    },

    onScreen: function(obj) {
      return obj.pos.x >= this.viewCenter.x - this.viewSize.x / 2 &&
        obj.pos.x <= this.viewCenter.x + this.viewSize.x / 2 &&
        obj.pos.y >= this.viewCenter.y - this.viewSize.y / 2 &&
        obj.pos.y <= this.viewCenter.y + this.viewSize.y / 2;
    }
  };

  var viewOffset = function(viewCenter, viewSize) {
    return {
      x:viewCenter.x - viewSize.x / 2,
      y:viewCenter.y - viewSize.y / 2
    }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);
