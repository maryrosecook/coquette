;(function(exports) {
  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    var canvas = document.getElementById(canvasId);
    this.renderer = new Coquette.Renderer(this, game, canvas, width, height, backgroundColor);
    this.inputter = new Coquette.Inputter(this, canvas, autoFocus);
    this.entities = new Coquette.Entities(this, game);
    this.runner = new Coquette.Runner(this);
    this.collider = new Coquette.Collider(this);

    var self = this;
    this.ticker = new Coquette.Ticker(this, function(interval) {
      self.collider.update(interval);
      self.runner.update(interval);
      if (game.update !== undefined) {
        game.update(interval);
      }

      self.entities.update(interval)
      self.renderer.update(interval);
      self.inputter.update();
    });
  };

  exports.Coquette = Coquette;
})(this);

;(function(exports) {
  var Collider = function(coquette) {
    this.c = coquette;
  };

  var isSetupForCollisions = function(obj) {
    return obj.center !== undefined && obj.size !== undefined;
  };

  var Shape = {
    isIntersecting: function(e1, e2) {
      var s1 = getBoundingBox(e1);
      var s2 = getBoundingBox(e2);

      var circle    = Collider.prototype.CIRCLE;
      var rectangle = Collider.prototype.RECTANGLE;

      if (s1 === rectangle && s2 === rectangle) {
        return Maths.rectanglesIntersecting(e1, e2);
      } else 
      if (s1 === circle    && s2 === rectangle) {
        return Maths.circleAndRectangleIntersecting(e1, e2);
      } else
      if (s1 === rectangle && s2 === circle) {
        return Maths.circleAndRectangleIntersecting(e2, e1);
      } else
      if (s1 === circle    && s2 === circle) {
        return Maths.circlesIntersecting(e1, e2);
      } else return undefined;
    }
  }

  var RectangleShape = function() {}
  RectangleShape.prototype = Shape;

  var CircleShape = function() {}
  CircleShape.prototype = Shape;

  Collider.prototype = {
    _currentCollisionPairs: [],

    update: function() {
      this._currentCollisionPairs = quadTreeCollisionPairs.apply(this, [this.c.entities.all()]);

      while (this._currentCollisionPairs.length > 0) {
        var pair = this._currentCollisionPairs.shift();
        this.collision(pair[0], pair[1]);
      }
    },

    collision: function(entity1, entity2) {
      notifyEntityOfCollision(entity1, entity2);
      notifyEntityOfCollision(entity2, entity1);
    },

    createEntity: function(entity) {
      var ent = this.c.entities.all();
      for (var i = 0, len = ent.length; i < len; i++) {
        if (ent[i] !== entity) { // decouple from when c.entities adds to _entities
          this._currentCollisionPairs.push([ent[i], entity]);
        }
      }
    },

    destroyEntity: function(entity) {
      // if coll detection happening, remove any pairs that include entity
      for(var i = this._currentCollisionPairs.length - 1; i >= 0; i--){
        if (this._currentCollisionPairs[i][0] === entity ||
           this._currentCollisionPairs[i][1] === entity) {
          this._currentCollisionPairs.splice(i, 1);
        }
      }
    },

    isIntersecting: function(obj1, obj2) {
      var shape1 = getBoundingBox(obj1);
      var shape2 = getBoundingBox(obj2);

      var result;
      if((result = shape1.isIntersecting(obj1, obj2)) !== undefined) {
        return result;
      } else
      if((result = shape2.isIntersecting(obj1, obj2)) !== undefined) {
        return result;
      } else {
        throw new Error("Unsupported bounding box shapes for collision detection.");
      }
    },

    isColliding: function(obj1, obj2) {
      return obj1 !== obj2 &&
        isSetupForCollisions(obj1) &&
        isSetupForCollisions(obj2) &&
        this.isIntersecting(obj1, obj2);
    },

    RECTANGLE: new RectangleShape(),
    CIRCLE:    new CircleShape()
  };

  var getDimensions = function(entities) {
    var maxx, minx, maxy, miny;

    entities.forEach(function(entity) {
      if(isSetupForCollisions(entity)) {
        if(maxx === undefined || entity.center.x > maxx) {
          maxx = entity.center.x;
        }
        if(minx === undefined || entity.center.x < minx) {
          minx = entity.center.x;
        }
        if(maxy === undefined || entity.center.y > maxy) {
          maxy = entity.center.y;
        }
        if(miny === undefined || entity.center.y < miny) {
          miny = entity.center.y;
        }
      }
    });

    var width  = maxx - minx;
    var height = maxy - miny;

    var worldSize   = {x: width, y: height };
    var worldCenter = {x: minx + width/2, y: miny + height/2};
    return [worldSize, worldCenter];
  };

  var quadTreeCollisionPairs = function(entities) {
    var dimensions = getDimensions(entities);

    var worldSize   = dimensions[0];
    var worldCenter = dimensions[1];

    var p1 = {x: worldCenter.x - worldSize.x/2,
              y: worldCenter.y - worldSize.y/2};
    var p2 = {x: worldCenter.x + worldSize.x/2,
              y: worldCenter.y + worldSize.y/2};


    this.quadTree = new Quadtree(p1, p2, {
      maxObj:   Math.max(Math.round(entities.length/4), 1),
      maxLevel: 5
    });
    var quadTree = this.quadTree;
    entities.forEach(function(entity) {
      quadTree.insert(entity);
    });

    quadTree.allCollisionPairs = allCollisionPairs.bind(this);
    return quadTree.collisions();
  };
  
  var allCollisionPairs = function(ent) {
    var potentialCollisionPairs = [];

    // get all entity pairs to test for collision
    for (var i = 0, len = ent.length; i < len; i++) {
      for (var j = i + 1; j < len; j++) {
        potentialCollisionPairs.push([ent[i], ent[j]]);
      }
    }

    var collisionPairs = [];
    potentialCollisionPairs.forEach(function(pair) {
      if(this.isColliding(pair[0], pair[1])) {
        collisionPairs.push(pair);
      }
    }.bind(this));

    return collisionPairs;
  };

  var getBoundingBox = function(obj) {
    return obj.boundingBox || Collider.prototype.RECTANGLE;
  };

  var notifyEntityOfCollision = function(entity, other) {
    if (entity.collision !== undefined) {
      entity.collision(other);
    }
  };

  var rotated = function(obj) {
    return obj.angle !== undefined && obj.angle !== 0;
  };

  var getAngle = function(obj) {
    return obj.angle === undefined ? 0 : obj.angle;
  };

  var Maths = {
    circlesIntersecting: function(obj1, obj2) {
      return Maths.distance(obj1.center, obj2.center) <
        obj1.size.x / 2 + obj2.size.x / 2;
    },

    rectanglesIntersecting: function(obj1, obj2) {
      if (!rotated(obj1) && !rotated(obj2)) {
        return this.unrotatedRectanglesIntersecting(obj1, obj2); // faster
      } else {
        return this.rotatedRectanglesIntersecting(obj1, obj2); // slower
      }
    },

    circleAndRectangleIntersecting: function(circleObj, rectangleObj) {
      var rectangleObjAngleRad = -getAngle(rectangleObj) * Maths.RADIANS_TO_DEGREES;

      var unrotatedCircleCenter = {
        x: Math.cos(rectangleObjAngleRad) *
          (circleObj.center.x - rectangleObj.center.x) -
          Math.sin(rectangleObjAngleRad) *
          (circleObj.center.y - rectangleObj.center.y) + rectangleObj.center.x,
        y: Math.sin(rectangleObjAngleRad) *
          (circleObj.center.x - rectangleObj.center.x) +
          Math.cos(rectangleObjAngleRad) *
          (circleObj.center.y - rectangleObj.center.y) + rectangleObj.center.y
      };

      var closest = { x: 0, y: 0 };

      if (unrotatedCircleCenter.x < rectangleObj.center.x - rectangleObj.size.x / 2) {
        closest.x = rectangleObj.center.x - rectangleObj.size.x / 2;
      } else if (unrotatedCircleCenter.x > rectangleObj.center.x + rectangleObj.size.x / 2) {
        closest.x = rectangleObj.center.x + rectangleObj.size.x / 2;
      } else {
        closest.x = unrotatedCircleCenter.x;
      }

      if (unrotatedCircleCenter.y < rectangleObj.center.y - rectangleObj.size.y / 2) {
        closest.y = rectangleObj.center.y - rectangleObj.size.y / 2;
      } else if (unrotatedCircleCenter.y > rectangleObj.center.y + rectangleObj.size.y / 2) {
        closest.y = rectangleObj.center.y + rectangleObj.size.y / 2;
      } else {
        closest.y = unrotatedCircleCenter.y;
      }

      return this.distance(unrotatedCircleCenter, closest) < circleObj.size.x / 2;
    },

    unrotatedRectanglesIntersecting: function(obj1, obj2) {
      if(obj1.center.x + obj1.size.x / 2 < obj2.center.x - obj2.size.x / 2) {
        return false;
      } else if(obj1.center.x - obj1.size.x / 2 > obj2.center.x + obj2.size.x / 2) {
        return false;
      } else if(obj1.center.y - obj1.size.y / 2 > obj2.center.y + obj2.size.y / 2) {
        return false;
      } else if(obj1.center.y + obj1.size.y / 2 < obj2.center.y - obj2.size.y / 2) {
        return false
      } else {
        return true;
      }
    },

    rotatedRectanglesIntersecting: function(obj1, obj2) {
      var obj1Normals = this.rectanglePerpendicularNormals(obj1);
      var obj2Normals = this.rectanglePerpendicularNormals(obj2);

      var obj1Corners = this.rectangleCorners(obj1);
      var obj2Corners = this.rectangleCorners(obj2);

      if (this.projectionsSeparate(
        this.getMinMaxProjection(obj1Corners, obj1Normals[1]),
        this.getMinMaxProjection(obj2Corners, obj1Normals[1]))) {
        return false;
      } else if (this.projectionsSeparate(
        this.getMinMaxProjection(obj1Corners, obj1Normals[0]),
        this.getMinMaxProjection(obj2Corners, obj1Normals[0]))) {
        return false;
      } else if (this.projectionsSeparate(
        this.getMinMaxProjection(obj1Corners, obj2Normals[1]),
        this.getMinMaxProjection(obj2Corners, obj2Normals[1]))) {
        return false;
      } else if (this.projectionsSeparate(
        this.getMinMaxProjection(obj1Corners, obj2Normals[0]),
        this.getMinMaxProjection(obj2Corners, obj2Normals[0]))) {
        return false;
      } else {
        return true;
      }
    },

    pointInsideObj: function(point, obj) {
      var objBoundingBox = getBoundingBox(obj);

      if (objBoundingBox === Collider.prototype.RECTANGLE) {
        return this.pointInsideRectangle(point, obj);
      } else if (objBoundingBox === Collider.prototype.CIRCLE) {
        return this.pointInsideCircle(point, obj);
      } else {
        throw "Tried to see if point inside object with unsupported bounding box.";
      }
    },

    pointInsideRectangle: function(point, obj) {
      var c = Math.cos(-getAngle(obj) * Maths.RADIANS_TO_DEGREES);
      var s = Math.sin(-getAngle(obj) * Maths.RADIANS_TO_DEGREES);

      var rotatedX = obj.center.x + c *
          (point.x - obj.center.x) - s * (point.y - obj.center.y);
      var rotatedY = obj.center.y + s *
          (point.x - obj.center.x) + c * (point.y - obj.center.y);

      var leftX = obj.center.x - obj.size.x / 2;
      var rightX = obj.center.x + obj.size.x / 2;
      var topY = obj.center.y - obj.size.y / 2;
      var bottomY = obj.center.y + obj.size.y / 2;

      return leftX <= rotatedX && rotatedX <= rightX &&
        topY <= rotatedY && rotatedY <= bottomY;
    },

    pointInsideCircle: function(point, obj) {
      return this.distance(point, obj.center) <= obj.size.x / 2;
    },

    distance: function(point1, point2) {
      var x = point1.x - point2.x;
      var y = point1.y - point2.y;
      return Math.sqrt((x * x) + (y * y));
    },

    vectorTo: function(start, end) {
      return {
        x: end.x - start.x,
        y: end.y - start.y
      };
    },

    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    leftNormalizedNormal: function(vector) {
      return {
        x: -vector.y,
        y: vector.x
      };
    },

    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    unitVector: function(vector) {
      return {
        x: vector.x / Maths.magnitude(vector),
        y: vector.y / Maths.magnitude(vector)
      };
    },

    projectionsSeparate: function(proj1, proj2) {
      return proj1.max < proj2.min || proj2.max < proj1.min;
    },

    getMinMaxProjection: function(objCorners, normal) {
      var min = Maths.dotProduct(objCorners[0], normal);
      var max = Maths.dotProduct(objCorners[0], normal);

      for (var i = 1; i < objCorners.length; i++) {
        var current = Maths.dotProduct(objCorners[i], normal);
        if (min > current) {
          min = current;
        }

        if (current > max) {
          max = current;
        }
      }

      return { min: min, max: max };
    },

    rectangleCorners: function(obj) {
      var corners = [ // unrotated
        { x:obj.center.x - obj.size.x / 2, y: obj.center.y - obj.size.y / 2 },
        { x:obj.center.x + obj.size.x / 2, y: obj.center.y - obj.size.y / 2 },
        { x:obj.center.x + obj.size.x / 2, y: obj.center.y + obj.size.y / 2 },
        { x:obj.center.x - obj.size.x / 2, y: obj.center.y + obj.size.y / 2 }
      ];

      var angle = getAngle(obj) * Maths.RADIANS_TO_DEGREES;

			for (var i = 0; i < corners.length; i++) {
				var xOffset = corners[i].x - obj.center.x;
				var yOffset = corners[i].y - obj.center.y;
				corners[i].x = obj.center.x +
          xOffset * Math.cos(angle) - yOffset * Math.sin(angle);
				corners[i].y = obj.center.y +
          xOffset * Math.sin(angle) + yOffset * Math.cos(angle);
			}

      return corners;
    },

    rectangleSideVectors: function(obj) {
      var corners = this.rectangleCorners(obj);
      return [
        { x: corners[0].x - corners[1].x, y: corners[0].y - corners[1].y },
        { x: corners[1].x - corners[2].x, y: corners[1].y - corners[2].y },
        { x: corners[2].x - corners[3].x, y: corners[2].y - corners[3].y },
        { x: corners[3].x - corners[0].x, y: corners[3].y - corners[0].y }
      ];
    },

    rectanglePerpendicularNormals: function(obj) {
      var sides = this.rectangleSideVectors(obj);
      return [
        Maths.leftNormalizedNormal(sides[0]),
        Maths.leftNormalizedNormal(sides[1])
      ];
    },

    RADIANS_TO_DEGREES: 0.01745
  };

  function Quadtree(p1, p2, settings, level) {
    this.p1 = p1;
    this.p2 = p2;

    var width  = this.p2.x-this.p1.x;
    var height = this.p2.y-this.p1.y;

    this.objects    = [];
    this.nodes      = [];
    this.rectangles = [];
    this.leaf       = true;
    this.settings   = settings;

    this.level   = level || 1;
  }

  Quadtree.prototype.insert = function(object) {
    var x = object.center.x;
    var y = object.center.y;
    if(isNaN(x) || isNaN(y)) return;

    if(this.leaf) {
      if(this.objects.length<this.settings.maxObj || this.level === this.settings.maxLevel) {
        this.objects.push(object);
        return this;
      } else {
        this.split();
        return this.insert(object);
      }
    } else {
      for(var i=0; i<this.nodes.length; i++) {
        if(Collider.prototype.isIntersecting(this.rectangles[i], object)) {
          this.nodes[i].insert(object);
        }
      }
    }
  }

  Quadtree.prototype.split = function() {
    var x1 = this.p1.x, x2 = this.p2.x, y1 = this.p1.y, y2 = this.p2.y, level = this.level;

    this.leaf     = false;
    var hx = (x2-x1)/2+x1;
    var hy = (y2-y1)/2+y1;
    this.nodes[0] = new Quadtree({x: x1, y: y1} , {x: hx, y: hy}, this.settings, level+1);
    this.nodes[1] = new Quadtree({x: hx, y: y1} , {x: x2, y: hy}, this.settings, level+1);
    this.nodes[2] = new Quadtree({x: x1, y: hy} , {x: hx, y: y2}, this.settings, level+1);
    this.nodes[3] = new Quadtree({x: hx, y: hy} , {x: x2, y: y2}, this.settings, level+1);

    var width  = this.p2.x-this.p1.x;
    var height = this.p2.y-this.p1.y;
    // Is always the same - thanks symmetry
    var size = {x: width/2,
                y: height/2} 

    this.rectangles[0] = {
      center: 
        {x:  width/4 + this.p1.x,
         y: height/4 + this.p1.y}, 
      size: size,
      boundingBox: Collider.prototype.RECTANGLE};
    this.rectangles[1] = {
      center: 
        {x:  width/4*3 + this.p1.x,
         y: height/4   + this.p1.y}, 
      size: size,
      boundingBox: Collider.prototype.RECTANGLE};
    this.rectangles[2] = {
      center: 
        {x:  width/4   + this.p1.x,
         y: height/4*3 + this.p1.y}, 
      size: size,
      boundingBox: Collider.prototype.RECTANGLE};
    this.rectangles[3] = {
      center: 
        {x:  width/4*3 + this.p1.x,
         y: height/4*3 + this.p1.y}, 
      size: size,
      boundingBox: Collider.prototype.RECTANGLE};

    for(var i=0; i<this.objects.length; i++) {
      var object = this.objects[i];
      this.insert(object);
    }
    this.objects.length = 0;
  }

  Quadtree.prototype.visit = function(callback) {
    if(!callback(this.objects, this) && !this.leaf) {
      this.nodes.forEach(function(node) {
        node.visit(callback);
      });
    }
  }

  Quadtree.prototype.collisions = function() {
    var collisions = [];
    var scanned    = {};
    this.visit(function(objects, quad) {
      this.allCollisionPairs(objects).forEach(function(pair) {
        var pairId = uniquePairId(pair);
        if(!scanned[pairId]) {
          collisions.push(pair);
          scanned[pairId] = true;
        }
      });
      return false;
    }.bind(this));
    return collisions;
  }

  function uniquePairId(pair) {
    return [Math.min(pair[0]._id, pair[1]._id), 
            Math.max(pair[0]._id, pair[1]._id)].toString();
  }

  exports.Collider = Collider;
  exports.Collider.Maths = Maths;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var Inputter = function(coquette, canvas, autoFocus) {
    var keyboardReceiver = autoFocus === false ? canvas : window;
    connectReceiverToKeyboard(keyboardReceiver, window, autoFocus);

    this._buttonListener = new ButtonListener(canvas, keyboardReceiver);
    this._mouseMoveListener = new MouseMoveListener(canvas);
  };

  Inputter.prototype = {
    update: function() {
      this._buttonListener.update();
    },

    // Returns true if passed button currently down
    isDown: function(button) {
      return this._buttonListener.isDown(button);
    },

    // Returns true if passed button just gone down. true once per keypress.
    isPressed: function(button) {
      return this._buttonListener.isPressed(button);
    },

    getMousePosition: function() {
      return this._mouseMoveListener.getMousePosition();
    },

    // Returns true if passed button currently down
    bindMouseMove: function(fn) {
      return this._mouseMoveListener.bind(fn);
    },

    // Stops calling passed fn on mouse move
    unbindMouseMove: function(fn) {
      return this._mouseMoveListener.unbind(fn);
    },

    LEFT_MOUSE: "LEFT_MOUSE",
    RIGHT_MOUSE: "RIGHT_MOUSE",

    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMI_COLON: 186,
    EQUALS: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_SQUARE_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_SQUARE_BRACKET: 221,
    SINGLE_QUOTE: 222
  };

  var ButtonListener = function(canvas, keyboardReceiver) {
    var self = this;
    this._buttonDownState = {};
    this._buttonPressedState = {};

    keyboardReceiver.addEventListener('keydown', function(e) {
      self._down(e.keyCode);
    }, false);

    keyboardReceiver.addEventListener('keyup', function(e) {
      self._up(e.keyCode);
    }, false);

    canvas.addEventListener('mousedown', function(e) {
      self._down(self._getMouseButton(e));
    }, false);

    canvas.addEventListener('mouseup', function(e) {
      self._up(self._getMouseButton(e));
    }, false);
  };

  ButtonListener.prototype = {
    update: function() {
      for (var i in this._buttonPressedState) {
        if (this._buttonPressedState[i] === true) { // tick passed and press event in progress
          this._buttonPressedState[i] = false; // end key press
        }
      }
    },

    _down: function(buttonId) {
      this._buttonDownState[buttonId] = true;
      if (this._buttonPressedState[buttonId] === undefined) { // start of new keypress
        this._buttonPressedState[buttonId] = true; // register keypress in progress
      }
    },

    _up: function(buttonId) {
      this._buttonDownState[buttonId] = false;
      if (this._buttonPressedState[buttonId] === false) { // prev keypress over
        this._buttonPressedState[buttonId] = undefined; // prep for keydown to start next press
      }
    },

    isDown: function(button) {
      return this._buttonDownState[button] || false;
    },

    isPressed: function(button) {
      return this._buttonPressedState[button] || false;
    },

    _getMouseButton: function(e) {
      if (e.which !== undefined || e.button !== undefined) {
        if (e.which === 3 || e.button === 2) {
          return Inputter.prototype.RIGHT_MOUSE;
        } else if (e.which === 1 || e.button === 0 || e.button === 1) {
          return Inputter.prototype.LEFT_MOUSE;
        }
      }

      throw "Cannot judge button pressed on passed mouse button event";
    }
  };

  var MouseMoveListener = function(canvas) {
    this._bindings = [];
    this._mousePosition;
    var self = this;

    var elementPosition = { x: canvas.offsetLeft, y: canvas.offsetTop };

    canvas.addEventListener('mousemove', function(e) {
      var absoluteMousePosition = self._getAbsoluteMousePosition(e);
      self._mousePosition = {
        x: absoluteMousePosition.x - elementPosition.x,
        y: absoluteMousePosition.y - elementPosition.y
      };
    }, false);

    canvas.addEventListener('mousemove', function(e) {
      for (var i = 0; i < self._bindings.length; i++) {
        self._bindings[i](self.getMousePosition());
      }
    }, false);
  };

  MouseMoveListener.prototype = {
    bind: function(fn) {
      this._bindings.push(fn);
    },

    unbind: function(fn) {
      for (var i = 0; i < this._bindings.length; i++) {
        if (this._bindings[i] === fn) {
          this._bindings.splice(i, 1);
          return;
        }
      }

      throw "Function to unbind from mouse moves was never bound";
    },

    getMousePosition: function() {
      return this._mousePosition;
    },

    _getAbsoluteMousePosition: function(e) {
	    if (e.pageX) 	{
        return { x: e.pageX, y: e.pageY };
	    } else if (e.clientX) {
        return { x: e.clientX, y: e.clientY };
      }
    }
  };

  var connectReceiverToKeyboard = function(keyboardReceiver, window, autoFocus) {
    if (autoFocus === false) {
      keyboardReceiver.contentEditable = true; // lets canvas get focus and get key events
    } else {
      var suppressedKeys = [
        Inputter.prototype.SPACE,
        Inputter.prototype.LEFT_ARROW,
        Inputter.prototype.UP_ARROW,
        Inputter.prototype.RIGHT_ARROW,
        Inputter.prototype.DOWN_ARROW
      ];

      // suppress scrolling
      window.addEventListener("keydown", function(e) {
        for (var i = 0; i < suppressedKeys.length; i++) {
          if(suppressedKeys[i] === e.keyCode) {
            e.preventDefault();
            return;
          }
        }
      }, false);
    }
  };

  exports.Inputter = Inputter;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  function Runner(coquette) {
    this.c = coquette;
    this._runs = [];
  };

  Runner.prototype = {
    update: function() {
      this.run();
    },

    run: function() {
      while(this._runs.length > 0) {
        var run = this._runs.shift();
        run.fn(run.obj);
      }
    },

    add: function(obj, fn) {
      this._runs.push({
        obj: obj,
        fn: fn
      });
    }
  };

  exports.Runner = Runner;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var interval = 16;

  function Ticker(coquette, gameLoop) {
    setupRequestAnimationFrame();

    var nextTickFn;
    this.stop = function() {
      nextTickFn = function() {};
    };

    this.start = function() {
      var prev = new Date().getTime();
      var tick = function() {
        var now = new Date().getTime();
        var interval = now - prev;
        prev = now;
        gameLoop(interval);
        requestAnimationFrame(nextTickFn);
      };

      nextTickFn = tick;
      requestAnimationFrame(nextTickFn);
    };

    this.start();
  };

  // From: https://gist.github.com/paulirish/1579671
  // Thanks Erik, Paul and Tino
  var setupRequestAnimationFrame = function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, interval - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                   timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  };

  exports.Ticker = Ticker;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var Maths;
  if(typeof module !== 'undefined' && module.exports) { // node
    Maths = require('./collider').Collider.Maths;
  } else { // browser
    Maths = Coquette.Collider.Maths;
  }

  var Renderer = function(coquette, game, canvas, wView, hView, backgroundColor) {
    this.c = coquette;
    this.game = game;
    canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
    canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
    this._ctx = canvas.getContext('2d');
    this._backgroundColor = backgroundColor;

    canvas.width = wView;
    canvas.height = hView;
    this._viewSize = { x:wView, y:hView };
    this._viewCenter = { x: this._viewSize.x / 2, y: this._viewSize.y / 2 };
  };

  Renderer.prototype = {
    getCtx: function() {
      return this._ctx;
    },

    getViewSize: function() {
      return this._viewSize;
    },

    getViewCenter: function() {
      return this._viewCenter;
    },

    setViewCenter: function(pos) {
      this._viewCenter = { x:pos.x, y:pos.y };
    },

    update: function(interval) {
      var ctx = this.getCtx();
      var viewTranslate = viewOffset(this._viewCenter, this._viewSize);

      ctx.translate(viewTranslate.x, viewTranslate.y);

      // draw background
      ctx.fillStyle = this._backgroundColor;
      ctx.fillRect(this._viewCenter.x - this._viewSize.x / 2,
                   this._viewCenter.y - this._viewSize.y / 2,
                   this._viewSize.x,
                   this._viewSize.y);

      // draw game and entities
      var drawables = [this.game]
        .concat(this.c.entities.all().sort(zindexSort));
      for (var i = 0, len = drawables.length; i < len; i++) {
        if (drawables[i].draw !== undefined) {
          var drawable = drawables[i];

          ctx.save();

          if (drawable.center !== undefined && drawable.angle !== undefined) {
            ctx.translate(drawable.center.x, drawable.center.y);
            ctx.rotate(drawable.angle * Maths.RADIANS_TO_DEGREES);
            ctx.translate(-drawable.center.x, -drawable.center.y);
          }

          drawables[i].draw(ctx);

          ctx.restore();
        }
      }

      ctx.translate(-viewTranslate.x, -viewTranslate.y);
    },

    onScreen: function(obj) {
      return Maths.rectanglesIntersecting(obj, {
        size: this._viewSize,
        center: {
          x: this._viewCenter.x,
          y: this._viewCenter.y
        }
      });
    }
  };

  var viewOffset = function(viewCenter, viewSize) {
    return {
      x: -(viewCenter.x - viewSize.x / 2),
      y: -(viewCenter.y - viewSize.y / 2)
    }
  };

  // sorts passed array by zindex
  // elements with a higher zindex are drawn on top of those with a lower zindex
  var zindexSort = function(a, b) {
    return (a.zindex || 0) < (b.zindex || 0) ? -1 : 1;
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var id = 0;

  function Entities(coquette, game) {
    this.c = coquette;
    this.game = game;
    this._entities = [];
  };

  Entities.prototype = {
    update: function(interval) {
      var entities = this.all();
      for (var i = 0, len = entities.length; i < len; i++) {
        if (entities[i].update !== undefined) {
          entities[i].update(interval);
        }
      }
    },

    all: function(Constructor) {
      if (Constructor === undefined) {
        return this._entities.slice(); // return shallow copy of array
      } else {
        var entities = [];
        for (var i = 0; i < this._entities.length; i++) {
          if (this._entities[i] instanceof Constructor) {
            entities.push(this._entities[i]);
          }
        }

        return entities;
      }
    },

    create: function(Constructor, settings) {
      var entity = new Constructor(this.game, settings || {});
      entity._id = id++;
      this.c.collider.createEntity(entity);
      this._entities.push(entity);
      return entity;
    },

    destroy: function(entity) {
      for(var i = 0; i < this._entities.length; i++) {
        if(this._entities[i] === entity) {
          this.c.collider.destroyEntity(entity);
          this._entities.splice(i, 1);
          break;
        }
      }
    }
  };

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);

