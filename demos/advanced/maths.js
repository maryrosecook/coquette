function Maths() { };

Maths.prototype = {
  plusMinus: function() {
    return Math.random() < 0.5 ? -1 : 1;
  },

  // adds change to current.  Resets to zero and continues changing if limit passed.
  // doesn't allow for change that encompasses more than one revolution
  dial: function(current, change, limit) {
    var absolute = current + change;
    if(current === 0 && limit === 0) {
      return 0;
    }
    else if(change < 0 && absolute < 0) {
      return limit + (absolute % limit);
    }
    else if(change > 0 && absolute > limit) {
      // removed (absolute - 1) - can't remember why it was there
      // was stopping change over limit with change of 1
      return absolute % limit;
    }
    else {
      return absolute;
    }
  },

  vectorTo: function(start, end) {
    return this.normalise({
      x: end.x - start.x,
      y: end.y - start.y
    });
  },

  distance: function(point1, point2) {
    var x = Math.abs(point1.x - point2.x);
    var y = Math.abs(point1.y - point2.y);
    return Math.sqrt((x * x) + (y * y));
  },

  center: function(obj) {
    if(obj.pos !== undefined) {
      return {
        x: obj.pos.x + (obj.size.x / 2),
        y: obj.pos.y + (obj.size.y / 2),
      };
    }
  },

  pointInside: function(point, obj) {
    objPos = this.floor(obj.pos);
    return point.x >= objPos.x
      && point.y >= objPos.y
      && point.x <= objPos.x + obj.size.x
      && point.y <= objPos.y + obj.size.y;
  },

  angleToVector: function(angle) {
    var r = this.degToRad(angle);

    var x = Math.cos(r) * this.DIR.UP.v.x - Math.sin(r) * this.DIR.UP.v.y;
    var y = Math.sin(r) * this.DIR.UP.v.x + Math.cos(r) * this.DIR.UP.v.y;
    var normalisedVec = this.normalise({ x: x, y: y });
    return normalisedVec;
  },

  vectorToAngle: function(vec) {
    var unitVec = this.normalise(vec);
    var uncorrectedDeg = this.radToDeg(Math.atan2(unitVec.x, -unitVec.y));
    var angle = uncorrectedDeg;
    if(uncorrectedDeg < 0) {
      angle = 360 + uncorrectedDeg;
    }

    return angle;
  },

  normalise: function(vec) {
    var v = this.vToSyl(vec).toUnitVector();
    return this.vFromSyl(v);
  },

  timePassed: function(last, interval) { return last + interval < new Date().getTime(); },

  zero: function() { return { x:0, y:0 }; },

  degToRad: function(degrees) { return 0.01745 * degrees; },
  radToDeg: function(rad) { return rad / 0.01745; },

  // from and to Sylvester
  vToSyl: function(vec) { return $V([vec.x, vec.y || 0]); },
  vFromSyl: function(vec) { return { x: vec.e(1), y: vec.e(2) } },
};
