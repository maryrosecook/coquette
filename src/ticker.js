within("coquette.maryrosecook.com", function() {
  var interval = 16;

  function Ticker(coquette, gameLoop) {
    setupRequestAnimationFrame();

    var nextTickFn;
    this.stop = function() {
      nextTickFn = function() {};
    };

    this.start = function() {
      var prev = new Date().getTime();
      var tick = function() {
        var now = new Date().getTime();
        var interval = now - prev;
        prev = now;
        gameLoop(interval);
        requestAnimationFrame(nextTickFn);
      };

      nextTickFn = tick;
      requestAnimationFrame(nextTickFn);
    };

    this.start();
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

  this.Ticker = Ticker;
});
