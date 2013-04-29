function Maths() { };

Maths.prototype = {
  copyPoint: function(point) {
    return { x: point.x, y: point.y };
  },

  opposite: function(dir) {
    return this.dirData(dir).opp;
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

  dirData: function(dir) {
    for(var i in this.DIR) {
      if(this.DIR[i].id === dir) {
        return this.DIR[i];
      }
    }
  },

  distributedVectors: function(num) {
    var v = [];
    var inc = 360 / num;
    for(var i = 0; i < num; i++) {
      v.push(this.angleToVector(i * inc));
    }

    return v;
  },

  vectorTo: function(start, end) {
    return this.normalise({
      x: end.x - start.x,
      y: end.y - start.y
    });
  },

  spread: function(num) {
    return (num / 2) + num * Math.random();
  },

  jitter: function(value, proportion) {
    var maxAdjust = value * proportion;
    return (value - (maxAdjust / 2)) + (maxAdjust * Math.random());
  },

  distance: function(point1, point2) {
    var x = Math.abs(point1.x - point2.x);
    var y = Math.abs(point1.y - point2.y);
    return Math.sqrt((x * x) + (y * y));
  },

  center: function(obj) {
    if(obj.pos !== null)
      return {
        x: obj.pos.x + (obj.size.x / 2),
        y: obj.pos.y + (obj.size.y / 2),
      };
    else
      return null;
  },

  pointInside: function(point, obj) {
    objPos = this.floor(obj.pos);
    return point.x >= objPos.x
      && point.y >= objPos.y
      && point.x <= objPos.x + obj.size.x
      && point.y <= objPos.y + obj.size.y;
  },

  rectanglesIntersecting: function(obj1, obj2) {
    if(obj1.pos.x + obj1.size.x < obj2.pos.x) {
      return false;
    } else if (obj1.pos.x > obj2.pos.x + obj2.size.x) {
      return false;
    } else if (obj1.pos.y > obj2.pos.y + obj2.size.y) {
      return false;
    } else if (obj1.pos.y + obj1.size.y < obj2.pos.y) {
      return false
    } else {
      return true;
    }
  },

  circlesIntersecting: function(obj1, obj2) {
    return this.distance(this.center(obj1), this.center(obj2)) <
      obj1.size.x / 2 + obj2.size.x / 2;
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

  floor: function(pos) {
    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y)
    };
  },

  identitySign: function(num) {
    return num < 0 ? -1 : 0;
  },

  withinRange: function(num, comparison, range) {
    return num > comparison - range && num < comparison + range;
  },

  // from: http://www.xarg.org/2010/06/is-an-angle-between-two-other-angles/
  withinSegment: function(n, a, b) {
	  n = (360 + (n % 360)) % 360;
	  a = (3600000 + a) % 360;
	  b = (3600000 + b) % 360;

	  if (a < b) {
		  return a <= n && n <= b;
    }
	  return a <= n || n <= b;
  },

  quickestDirection: function(start, end, limit) {
    var halfLimit = limit / 2;
    if(end > start) {
      return end - start <= halfLimit ? this.DIR.RIGHT.id : this.DIR.LEFT.id;
    }
    else {
      return start - end < halfLimit ? this.DIR.LEFT.id : this.DIR.RIGHT.id;
    }
  },

  timePassed: function(last, interval) { return last + interval < new Date().getTime(); },

  zero: function() { return { x:0, y:0 }; },

  degToRad: function(degrees) { return 0.01745 * degrees; },
  radToDeg: function(rad) { return rad / 0.01745; },

  // from and to Sylvester
  vToSyl: function(vec) { return $V([vec.x, vec.y || 0]); },
  vFromSyl: function(vec) { return { x: vec.e(1), y: vec.e(2) } },

  DIR: {
    LEFT: {
      id: "LEFT", v: { x: -1, y: 0 }, opp: "RIGHT", sign: -1, angle: 270
    },
    RIGHT: {
      id: "RIGHT", v: { x: 1, y: 0 }, opp: "LEFT", sign: 1, angle: 90
    },
    UP: {
      id: "UP", v: { x: 0, y: -1 }, opp: "DOWN", sign: -1, angle: 0
    },
    DOWN: {
      id: "DOWN", v: { x: 0, y: 1 }, opp: "UP", sign: 1, angle: 180
    },
  },

  COLORS: [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
    'white'
  ],

  COLOR_TO_SPRITE: {
    'red': 0,
    'orange': 1,
    'yellow': 2,
    'green': 3,
    'blue': 4,
    'indigo': 5,
    'violet': 6,
    'white': 7
  }
};
