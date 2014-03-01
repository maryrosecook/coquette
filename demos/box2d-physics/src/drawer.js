;(function(exports) {
  exports.Drawer = function(game, ctx) {
    this.game = game;
    this.ctx = ctx;
  };

  exports.Drawer.prototype = {
    startClip: function(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.game.c.renderer.getViewCenter().x,
              this.game.c.renderer.getViewCenter().y,
              this.game.c.renderer.getViewSize().x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    },

    endClip: function(ctx) {
      ctx.restore();
    },

    circle: function(center, radius, strokeColor, fillColor, lineWidth) {
      describeCircle(this.ctx, center, radius);

      if (strokeColor !== undefined) {
        this.ctx.lineWidth = lineWidth || 1;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
      }

      if (fillColor !== undefined) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
      }
    },

    line: function(from, to, lineWidth, strokeColor) {
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.closePath();

      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.stroke();
    },

    triangle: function(center, width, strokeColor, fillColor) {
      var h = Maths.equilateralTriangleHeight(width);

      this.ctx.beginPath();
      this.ctx.moveTo(center.x - width / 2, center.y + h / 2); // bottom left
      this.ctx.lineTo(center.x, center.y - h / 2); // top
      this.ctx.lineTo(center.x + width / 2, center.y + h / 2); // bottom right
      this.ctx.lineTo(center.x - width / 2, center.y + h / 2); // bottom left
      this.ctx.closePath();

      if (strokeColor !== undefined) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.stroke();
      }

      if (fillColor !== undefined) {
        this.ctx.fillStyle = fillColor;
        this.ctx.lineWidth = 1;
        this.ctx.fill();
      }
    },

    getHome: function() {
      var viewSize = this.game.c.renderer.getViewSize();
      return { x: viewSize.x * 0.3, y: viewSize.y * 0.3 };
    },

    point: function(center, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(center.x, center.y, 1, 1);
    },

    moveViewTowards: function(targetPoint, delta) {
      var currentPoint = this.game.c.renderer.getViewCenter();
      var distanceToGo = Maths.distance(currentPoint, targetPoint);

      if (distanceToGo < 1) {
        this.game.c.renderer.setViewCenter(targetPoint);
      } else {
        this.game.c.renderer.setViewCenter({
          x: currentPoint.x - (currentPoint.x - targetPoint.x) * delta,
          y: currentPoint.y - (currentPoint.y - targetPoint.y) * delta
        });
      }
    },

    rectangle: function(center, size, strokeColor, fillColor) {
      if (strokeColor !== undefined) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.strokeRect(center.x - size.x / 2, center.y - size.y / 2,
                            size.x, size.y);
      }

      if (fillColor !== undefined) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(center.x - size.x / 2, center.y - size.y / 2,
                          size.x, size.y);
      }
    }
  };

  var describeCircle = function(ctx, center, radius) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
  };
})(this);
