;(function(exports) {
  exports.Flock = function(game, settings) {
    this.game = game;
    this.members = [];
    this.center = settings.center;

    var self = this;
    this.add = function(member) {
      this.members.push(member);
      member.flock = this;

      andro.eventer(member).bind(member, "owner:destroy", function() {
        self.members.splice(self.members.indexOf(member), 1);
        member.flock = undefined;
        if (self.members.length === 0) {
          game.c.entities.destroy(self);
        }

        andro.eventer(self).emit("owner:memberDestroyed", member);
      });
    };
  };

  Flock.SIZE = { x: 20, y: 20 };
  Flock.SHAPE = "circle";

  Flock.prototype = {
    otherMembers: function(member) {
      return _.filter(this.members, function(x) { return x !== member; });
    },

    contains: function(bird) {
      return utils.contains(bird, this.members)
    },

    destroy: function() {
      if (this.members.length > 0) {
        this.members[0].destroy();
        this.destroy();
      }
    }
  };
})(this);
