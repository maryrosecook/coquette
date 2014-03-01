;(function(exports) {
  exports.push = {
    setup: function(owner, eventer, settings) {
      eventer.bind(this, 'push:go', function(data) {
        owner.body.push({ x: data.vector.x, y: data.vector.y },
                        data.speedLimit);
      });
    }
  }
}(this));
