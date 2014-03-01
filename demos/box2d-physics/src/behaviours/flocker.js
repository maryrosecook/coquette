;(function(exports) {
  exports.flocker = {
    getVector: function(bird, otherBirds, center, acceleration, weights) {
      var vec = combine([
        { weight: weights.orbit, v: orbit(bird, center) },
        { weight: weights.heading, v: heading(otherBirds) },
        { weight: weights.separation, v: separation(bird, otherBirds, NEIGHBOR_DISTANCE) },
        { weight: weights.cohesion, v: cohesion(bird, otherBirds) }
      ]);

      return {
        x: vec.x * acceleration,
        y: vec.y * acceleration,
      };
    }
  };

  var NEIGHBOR_DISTANCE = 40;

  var heading = function(members) {
    return sumVectors(_.pluck(members, 'vec'));
  };

  var orbit = function(member, center) {
    return Maths.vectorTo(member.center, center);
  };

  var separation = function(member, members, neighborDistance) {
    var vectorToNeighbors = sumVectors(_.map(members, function(x) {
      if (Maths.distance(member.center, x.center) < neighborDistance) {
        return Maths.vectorTo(member.center, x.center);
      } else {
        return { x: 0, y: 0 };
      }
    }));

    return { x: -vectorToNeighbors.x, y: -vectorToNeighbors.y };
  };

  var cohesion = function(member, members) {
    return sumVectors(_.map(members, function(x) {
      return Maths.vectorTo(member.center, x.center);
    }));
  };

  // normalize, combine based on weights
  var combine = function(vectorsAndWeights) {
    var unusedWeight = _.reduce(vectorsAndWeights, function(a, e) {
      return e.v.x === 0 && e.v.y === 0 ? e.weight + a : 0;
    }, 0);

    var combinedV = _.reduce(vectorsAndWeights, function(a, e) {
      var unitV = Maths.unitVector(e.v);
      a.x += e.weight * unitV.x;
      a.y += e.weight * unitV.y;
      return a;
    }, { x: 0, y: 0 });

    return combinedV;
  };

  var sumVectors = function(vectors) {
    return _.reduce(vectors, function(a, v) {
      a.x += v.x;
      a.y += v.y;
      return a;
    }, { x: 0, y: 0 });
  };
})(this);
