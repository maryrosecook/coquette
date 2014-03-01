;(function(exports) {
  exports.destroy = {
    setup: function(owner) {
      return {
        destroy: function(other) {
          owner.game.c.entities.destroy(owner);
          owner.game.physics.destroyBody(owner.body);
          andro.eventer(owner).emit('owner:destroy', other);
          andro.eventer(owner).unbindAll();
        }
      }
    }
  }
}(this));
