;(function(exports) {
  var interval = 16;

  function Updater() {
    setupRequestAnimationFrame();
    this.updatees = [];
    this.tick = interval;
    this.prev = new Date().getTime();

    var self = this;
    var update = function() {
      var now = new Date().getTime();
      self.tick = now - self.prev;
      self.prev = now;

      // call update fns
      self.game.update(); // make sure game updated before everything else
      for (var i = 0; i < self.updatees.length; i++) {
        self.updatees[i].update();
      }

      // call draw fns
      self.game.draw();
      for (var i = 0; i < self.updatees.length; i++) {
        if (self.updatees[i].draw !== undefined) {
          self.updatees[i].draw();
        }
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  Updater.prototype = {
    add: function(updatee) {
      this.updatees.push(updatee);
    },

    // adds game as special updatee that gets updated first
    addGame: function(game) {
      this.game = game;
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

  // From: https://gist.github.com/paulirish/1579671
  // Thanks Erik, Paul and Tino
  var setupRequestAnimationFrame = function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, interval - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                   timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  };

  exports.Updater = Updater;
})(typeof exports === 'undefined' ? this.Coquette : exports);
