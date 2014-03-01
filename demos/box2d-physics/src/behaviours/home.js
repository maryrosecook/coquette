;(function(exports) {
  exports.home = {
    target: undefined,
    setup: function(owner, eventer, settings) {
      this.owner = owner;
      this.eventer = eventer;
      this.settings = settings;

      eventer.bind(this, 'home:go', function(target) {
        chaseTarget(target, owner, eventer, settings);
      });
    }
  };

  var chaseTarget = function(target, owner, eventer, settings) {
    var toTargetUnit = Maths.unitVector({
      x: target.center.x - owner.center.x,
      y: target.center.y - owner.center.y
    });

    eventer.emit('push:go', {
      vector: {
        x: toTargetUnit.x * settings.acceleration,
        y: toTargetUnit.y * settings.acceleration,
      }
    });

    var currentAngle = Maths.vectorToAngle(owner.vec);
    var angleToTarget = Maths.vectorToAngle(toTargetUnit);
    var max = Math.max(currentAngle, angleToTarget);
    var min = Math.min(currentAngle, angleToTarget);
    var error = Math.min(max - min, 360 - max + min) / 180;
    owner.body.drag(error * settings.turnSpeed);
  };
}(this));
