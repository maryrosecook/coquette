;(function() {
  var interval = 16;

  function Updater() {
    this.updatees = [];
    this.tick = interval;
    this.prev = new Date().getTime();

    var self = this;
    var requestAnimationFrame = window.requestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.webkitRequestAnimationFrame;
    var update = function() {
      var now = new Date().getTime();
      self.tick = now - self.prev;
      self.prev = now;
      game.update(); // make sure game updated before everything else
      for (var i = 0; i < self.updatees.length; i++) {
        self.updatees[i].update();
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  Updater.prototype = {
    add: function(updatee) {
      this.updatees.push(updatee);
    },

    remove: function(updatee) {
      for(var i = 0; i < this.updatees.length; i++) {
        if(this.updatees[i] === updatee) {
          this.updatees.splice(i, 1);
          break;
        }
      }
    }
  };

  this.Updater = Updater;
}).call(this);
