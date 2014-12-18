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
      if(entity.center) {
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
