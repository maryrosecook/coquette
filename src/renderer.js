within("coquette.maryrosecook.com", function() {
  var Maths = this.Collider.Maths;

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
    this.viewCenterPos = { x: this.viewSize.x / 2, y: this.viewSize.y / 2 };
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
      var drawables = [this.game]
        .concat(this.coquette.entities.all().concat().sort(zindexSort));
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
        pos: {
          x: this.viewCenterPos.x - this.viewSize.x / 2,
          y: this.viewCenterPos.y - this.viewSize.y / 2
        }
      });
    }
  };

  var viewOffset = function(viewCenterPos, viewSize) {
    return {
      x:viewCenterPos.x - viewSize.x / 2,
      y:viewCenterPos.y - viewSize.y / 2
    }
  };

  // sorts passed array by zindex
  // elements with a higher zindex are drawn on top of those with a lower zindex
  var zindexSort = function(a, b) {
    return (a.zindex || 0) < (b.zindex || 0) ? -1 : 1;
  };

  this.Renderer = Renderer;
});

if (typeof exports === 'undefined') {
  this.Coquette.Renderer = within("coquette.maryrosecook.com").get("Renderer");
} else {
  exports.Renderer = within("coquette.maryrosecook.com").get("Renderer");
}
