;(function(exports) {
  exports.Radar = function(game) {
    this.game = game;
  };

  var ARC_ANGLE_OFFSET = -Maths.degToRad(90); // "0" is 90

  exports.Radar.prototype = {
    draw: function(ctx) {
      var self = this;
      var viewRadius = this.game.c.renderer.getViewSize().x / 2;
      var viewCenter = self.game.c.renderer.getViewCenter();
      var m = Coquette.Collider.Maths;

      var possibleRadarEntities = _.filter(this.game.c.entities.all(), function(x) {
        return _.any([Dot, Stuka], function(y) { return x instanceof y; });
      });

      var radarEntities = _.filter(possibleRadarEntities, function(x) {
        return m.distance(self.game.c.renderer.getViewCenter(), x.center) > viewRadius;
      });

      _.each(radarEntities, function(entity) {
        var vectorToEntity = m.unitVector(m.vectorTo(viewCenter, entity.center));
        vectorToEntity.x *= viewRadius;
        vectorToEntity.y *= viewRadius;

        var arcStartEndRad = extremityAnglesRad(viewCenter, entity);

        ctx.strokeStyle = entity.color || entity.getColor();
        ctx.beginPath();
        ctx.arc(viewCenter.x, viewCenter.y, viewRadius - 1,
                arcStartEndRad[0] + ARC_ANGLE_OFFSET,
                arcStartEndRad[1] + ARC_ANGLE_OFFSET, false);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  };

  var extremityAnglesRad = function(fromPoint, entity) {
    var m = Coquette.Collider.Maths;
    var adjacent = m.distance(fromPoint, entity.center);
    var opposite = entity.size.x / 2; // assume roughly square shape
    var angleToCenterRad = Maths.degToRad(
      Maths.vectorToAngle(m.vectorTo(fromPoint, entity.center)));
    var centerToExtremityAngleRad = Math.atan(opposite / adjacent);
    return [angleToCenterRad - centerToExtremityAngleRad,
            angleToCenterRad + centerToExtremityAngleRad];
  };
})(this);
