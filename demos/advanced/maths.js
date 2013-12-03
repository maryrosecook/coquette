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

  },

    }

    return angle;
  },

  normalise: function(vec) {
    var v = this.vToSyl(vec).toUnitVector();
    return this.vFromSyl(v);
  },

  degToRad: function(degrees) { return 0.01745 * degrees; },
  radToDeg: function(rad) { return rad / 0.01745; },

  // from and to Sylvester
  vToSyl: function(vec) { return $V([vec.x, vec.y || 0]); },
  vFromSyl: function(vec) { return { x: vec.e(1), y: vec.e(2) } },
};
