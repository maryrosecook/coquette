;(function(exports) {
  var RandomRemovalBuffer = exports.RandomRemovalBuffer = function(size) {
    var buffer = [];

    this.push = function(item) {
      buffer.push(item);
      if (buffer.length > size) {
        // buffer too big - remove random item from it
        buffer.splice(Math.floor(Math.random() * buffer.length), 1);
      }
    };

    this.all = function() {
      return buffer.concat();
    };
  };
})(this);
