;(function(exports) {
  exports.utils = {
    type: function(x) {
      return Object.prototype.toString.call(x).match(/\[object ([^\]]+)\]/)[1];
    },

    mixin: function(from, to) {
      for (var i in from) {
        to[i] = from[i];
      }

      return to;
    },

    contains: function(item, array) {
      for (var i = 0; i < array.length; i++) {
        if (item === array[i]) {
          return true;
        }
      }

      return false;
    }
  };
})(this);
