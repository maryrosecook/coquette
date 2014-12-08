;(function(exports) {
  var Collider = function(coquette) {
    this.c = coquette;
    this._getCollisionPairs = quadTreeCollisionPairs;
  };

  var isSetupForCollisions = function(obj) {
    return obj.center !== undefined && obj.size !== undefined;
  };

  var RectangleShape = function(entity) {
    this.entity = entity;
  }

  RectangleShape.prototype = {
    isIntersecting: function(anotherShape) {
      if(anotherShape instanceof CircleShape) {
        return Maths.circleAndRectangleIntersecting(anotherShape.entity, this.entity);
      }
      if(anotherShape instanceof RectangleShape) {
        return Maths.rectanglesIntersecting(this.entity, anotherShape.entity);
      }
      if(anotherShape.isIntersecting) {
        return anotherShape.isIntersecting(this);
      }
      throw "Objects being collision tested have unsupported bounding box types."
    }
  }

  var CircleShape = function(entity) {
    this.entity = entity;
  }

  CircleShape.prototype = {
    isIntersecting: function(anotherShape) {
      if(anotherShape instanceof CircleShape) {
        return Maths.circlesIntersecting(this.entity, anotherShape.entity);
      }
      if(anotherShape instanceof RectangleShape) {
        return Maths.circleAndRectangleIntersecting(this.entity, anotherShape.entity);
      }
      if(anotherShape.isIntersecting) {
        return anotherShape.isIntersecting(this);
      }
      throw "Objects being collision tested have unsupported bounding box types."
    }
  }

  Collider.prototype = {
    _currentCollisionPairs: [],

    _useQuadtree: function(useQuadtree) {
      if(useQuadtree) {
        this._getCollisionPairs = quadTreeCollisionPairs;
      } else {
        this._getCollisionPairs = allCollisionPairs;
        this.quadTree = undefined;
      }
    },

    update: function() {
      var collisionPairs = this._getCollisionPairs(this.c.entities.all());
      collisionPairs.forEach(function(pair) {
        this.collision(pair[0], pair[1]);
      }.bind(this));
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
      return isIntersecting(obj1, obj2);
    },

    isColliding: function(obj1, obj2) {
      return obj1 !== obj2 &&
        isSetupForCollisions(obj1) &&
        isSetupForCollisions(obj2) &&
        this.isIntersecting(obj1, obj2);
    },

    RECTANGLE: 0,
    CIRCLE: 1
  };

  var isColliding = function(obj1, obj2) {
    return isSetupForCollisions(obj1) && isSetupForCollisions(obj2) &&
      isIntersecting(obj1, obj2);
  };

  var isIntersecting = function(obj1, obj2) {
    var shape1 = getBoundingBox(obj1);
    var shape2 = getBoundingBox(obj2);

    return shape1.isIntersecting(shape2);
  };

  var quadTreeCollisionPairs = function(entities) {
    var viewSize   = this.c.renderer.getViewSize();
    var viewCenter = this.c.renderer.getViewCenter();

    var x1 = viewCenter.x - viewSize.x/2;
    var y1 = viewCenter.y - viewSize.y/2;
    var x2 = viewCenter.x + viewSize.x/2;
    var y2 = viewCenter.y + viewSize.y/2;

    this.quadTree = new Quadtree(x1, y1, x2, y2);
    this.quadTree.settings = {
      maxObj:   Math.max(Math.round(entities.length/4), 1),
      maxLevel: 5
    };
    var quadTree = this.quadTree;
    entities.forEach(function(entity) {
      quadTree.insert(entity);
    });

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
      if (isColliding(pair[0], pair[1])) {
        collisionPairs.push(pair);
      }
    });

    return collisionPairs;
  };

  var getBoundingBox = function(obj) {
    return obj.boundingBox || new Collider.Shape.Rectangle(obj);
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

  function Quadtree(x1, y1, x2, y2, level) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;

    var width  = this.x2-this.x1;
    var height = this.y2-this.y1;
    this.rectangle  = this.createRectangle(x1, y1, x2, y2);

    this.objects    = [];
    this.nodes      = [];
    this.rectangles = [];
    this.leaf       = true;
    this.settings   = {maxObj: 1, maxLevel: 5};

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
        if(this.rectangles[i].isIntersecting(getBoundingBox(object))) {
          this.nodes[i].insert(object);
        }
      }
    }
  }

  Quadtree.prototype.split = function() {
    var x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2, level = this.level;

    this.leaf     = false;
    var hx = (x2-x1)/2+x1;
    var hy = (y2-y1)/2+y1;
    this.nodes[0] = new Quadtree(x1, y1, hx, hy, level+1);
    this.nodes[1] = new Quadtree(hx, y1, x2, hy, level+1);
    this.nodes[2] = new Quadtree(x1, hy, hx, y2, level+1);
    this.nodes[3] = new Quadtree(hx, hy, x2, y2, level+1);

    var width  = this.x2-this.x1;
    var height = this.y2-this.y1;
    // Is always the same - thanks symmetry
    var size = {x: width/2,
                y: height/2} 

    this.rectangles[0] = new Coquette.Collider.Shape.Rectangle({
      center: 
        {x:  width/4 + this.x1,
         y: height/4 + this.y1}, 
      size: size});
    this.rectangles[1] = new Coquette.Collider.Shape.Rectangle({
      center: 
        {x:  width/4*3 + this.x1,
         y: height/4   + this.y1}, 
      size: size});
    this.rectangles[2] = new Coquette.Collider.Shape.Rectangle({
      center: 
        {x:  width/4   + this.x1,
         y: height/4*3 + this.y1}, 
      size: size});
    this.rectangles[3] = new Coquette.Collider.Shape.Rectangle({
      center: 
        {x:  width/4*3 + this.x1,
         y: height/4*3 + this.y1}, 
      size: size});

    for(var i=0; i<this.objects.length; i++) {
      var object = this.objects[i];
      this.insert(object);
    }
    this.objects.length = 0;
  }

  Quadtree.prototype.createRectangle = function(x1, y1, x2, y2) {
    var width  = this.x2-this.x1;
    var height = this.y2-this.y1;
    return new Coquette.Collider.Shape.Rectangle({
      center: 
        {x:  width/2 + x1,
         y: height/2 + y1}, 
      size: 
        {x: width,
         y: height} 
    });
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
      allCollisionPairs(objects).forEach(function(pair) {
        var pairId = uniquePairId(pair);
        if(!scanned[pairId]) {
          collisions.push(pair);
          scanned[pairId] = true;
        }
      });
      return false;
    });
    return collisions;
  }

  function uniquePairId(pair) {
    return [Math.min(pair[0]._id, pair[1]._id), 
            Math.max(pair[0]._id, pair[1]._id)].toString();
  }

  exports.Collider = Collider;
  exports.Collider.Maths = Maths;
  exports.Collider.Shape = {
    Rectangle: RectangleShape,
    Circle:    CircleShape
  }
})(typeof exports === 'undefined' ? this.Coquette : exports);
