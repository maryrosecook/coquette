;(function() {
  this.follow = {
    setup: function(owner, eventer, settings) {
      eventer.bind(this, 'follow:go', function(target) {
        var toTargetUnit = Maths.unitVector({
          x: target.center.x - owner.center.x,
          y: target.center.y - owner.center.y
        });

        var distance = Maths.distance(owner.center, target.center);
        var startSlowing = 100;
        var fullStop = 50;

        owner.body.drag(0.00002);

        var acceleration;
        if (distance > startSlowing) {
          acceleration = settings.acceleration;
        } else if (distance > fullStop) {
          acceleration = (distance - fullStop) / (startSlowing - fullStop) *
            settings.acceleration;
        } else {
          acceleration = 0;
        }

        eventer.emit('push:go', {
          vector: pull(toTargetUnit, owner.body.mass(), acceleration)
        });

        // pull target towards follower
        // if (distance > 150) {
        //   andro.eventer(owner.target).emit('push:go', {
        //     vector: pull({
        //       x: -toTargetUnit.x,
        //       y: -toTargetUnit.y
        //     }, owner.target.body.mass(), settings.acceleration * 0.5)
        //   });
        // }
      });
    }
  };

  var pull = function(direction, acceleration, mass) {
    return {
      x: direction.x * mass * acceleration,
      y: direction.y * mass * acceleration
    };
  };

}).call(this);
