;(function(exports) {
  function Runner(coquette) {
    this.c = coquette;
    this._runs = [];
  };

  Runner.prototype = {
    update: function() {
      this.run();
    },

    run: function() {
      while(this._runs.length > 0) {
        var run = this._runs.shift();
        run.fn(run.obj);
      }
    },

    add: function(obj, fn) {
      this._runs.push({
        obj: obj,
        fn: fn
      });
    }
  };

  exports.Runner = Runner;
})(typeof exports === 'undefined' ? this.Coquette : exports);
