;(function(exports) {
  var Maths;
  if(typeof module !== 'undefined' && module.exports) { // node
    Maths = require('./collider').Collider.Maths;
  } else { // browser
    Maths = Coquette.Collider.Maths;
  }

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

      var viewTranslate = viewOffset(this.viewCenterPos, this.viewSize);

      // translate so all objs placed relative to viewport
      ctx.translate(-viewTranslate.x, -viewTranslate.y);

      // draw background
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(this.viewCenterPos.x - this.viewSize.x / 2,
                   this.viewCenterPos.y - this.viewSize.y / 2,
                   this.viewSize.x,
                   this.viewSize.y);

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
      return Maths.rectanglesIntersecting(obj, {
        size: this.viewSize,
        pos: this.viewCenterPos
      });
    }
  };

  var viewOffset = function(viewCenterPos, viewSize) {
    return {
      x:viewCenterPos.x - viewSize.x / 2,
      y:viewCenterPos.y - viewSize.y / 2
    }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);
