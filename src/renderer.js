;(function(exports) {
  var Renderer = function(canvasId, width, height) {
    var canvas = document.getElementById(canvasId);
    this.ctx = canvas.getContext('2d');
    canvas.width = this.width = width;
    canvas.height = this.height = height;
  };

  Renderer.prototype = {
    clear: function(color) {
      this.ctx.fillStyle = color;
		  this.ctx.fillRect(0, 0, this.width, this.height);
    },

    center: function() {
      return {
        x: this.width / 2,
        y: this.height / 2
      };
    },

    onScreen: function(obj) {
      return obj.pos.x > 0 && obj.pos.x < game.renderer.width &&
        obj.pos.y > 0 && obj.pos.y < game.renderer.height;
    },

    circle: function(pos, radius, color) {
      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x + radius, pos.y + radius,
                   radius, 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.stroke();
    },

    startClip: function() {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.width / 2, this.height / 2,
                   this.width / 2 , 0, Math.PI * 2, true);
      this.ctx.closePath();
      this.ctx.clip();
    },

    endClip: function() {
      this.ctx.restore();
    },
  };

  exports.Renderer = Renderer;
})(this);
