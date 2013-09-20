;(function(exports) {
  var Collider = function(coquette) {
    this.coquette = coquette;
  };

  // if no entities have uncollision(), skip expensive record keeping for uncollisions
  var isUncollisionOn = function(entities) {
    for (var i = 0, len = entities.length; i < len; i++) {
      if (entities[i].uncollision !== undefined) {
        return true;
      }
    }
    return false;
  };

  var isSetupForCollisions = function(obj) {
    return obj.pos !== undefined && obj.size !== undefined;
  };

  Collider.prototype = {
    collideRecords: [],

    update: function() {
      var ent = this.coquette.entities.all();
      for (var i = 0, len = ent.length; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
          if (this.isColliding(ent[i], ent[j])) {
            this.collision(ent[i], ent[j]);
          } else {
            this.removeOldCollision(this.getCollideRecordIds(ent[i], ent[j])[0]);
          }
        }
      }
    },

    collision: function(entity1, entity2) {
      var collisionType;
      if (!isUncollisionOn(this.coquette.entities.all())) {
        collisionType = this.INITIAL;
      } else if (this.getCollideRecordIds(entity1, entity2).length === 0) {
        this.collideRecords.push([entity1, entity2]);
        collisionType = this.INITIAL;
      } else {
        collisionType = this.SUSTAINED;
      }

      notifyEntityOfCollision(entity1, entity2, collisionType);
      notifyEntityOfCollision(entity2, entity1, collisionType);
    },

    destroyEntity: function(entity) {
      var recordIds = this.getCollideRecordIds(entity);
      for (var i = 0; i < recordIds.length; i++) {
        this.removeOldCollision(recordIds[i]);
      }
    },

    // remove collision at passed index
    removeOldCollision: function(recordId) {
      var record = this.collideRecords[recordId];
      if (record !== undefined) {
        notifyEntityOfUncollision(record[0], record[1])
        notifyEntityOfUncollision(record[1], record[0])
        this.collideRecords.splice(recordId, 1);
      }
    },

    getCollideRecordIds: function(entity1, entity2) {
      if (entity1 !== undefined && entity2 !== undefined) {
        var recordIds = [];
        for (var i = 0, len = this.collideRecords.length; i < len; i++) {
          if (this.collideRecords[i][0] === entity1 && this.collideRecords[i][1] === entity2) {
            recordIds.push(i);
          }
        }
        return recordIds;
      } else if (entity1 !== undefined) {
        for (var i = 0, len = this.collideRecords.length; i < len; i++) {
          if (this.collideRecords[i][0] === entity1 || this.collideRecords[i][1] === entity1) {
            return [i];
          }
        }
        return [];
      } else {
        throw "You must pass at least one entity when searching collision records."
      }
    },

    isColliding: function(obj1, obj2) {
      return isSetupForCollisions(obj1) && isSetupForCollisions(obj2) &&
        this.isIntersecting(obj1, obj2);
    },

    isIntersecting: function(obj1, obj2) {
      var obj1BoundingBox = obj1.boundingBox || this.RECTANGLE;
      var obj2BoundingBox = obj2.boundingBox || this.RECTANGLE;

      if (obj1BoundingBox === this.RECTANGLE && obj2BoundingBox === this.RECTANGLE) {
        return Maths.rectanglesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.CIRCLE && obj2BoundingBox === this.RECTANGLE) {
        return Maths.circleAndRectangleIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.RECTANGLE && obj2BoundingBox === this.CIRCLE) {
        return Maths.circleAndRectangleIntersecting(obj2, obj1);
      } else if (obj1BoundingBox === this.POINT && obj2BoundingBox === this.RECTANGLE) {
        return Maths.pointAndRectangleIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.RECTANGLE && obj2BoundingBox === this.POINT) {
        return Maths.pointAndRectangleIntersecting(obj2, obj1);
      } else if (obj1BoundingBox === this.CIRCLE && obj2BoundingBox === this.CIRCLE) {
        return Maths.circlesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.POINT && obj2BoundingBox === this.CIRCLE) {
        return Maths.pointAndCircleIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === this.CIRCLE && obj2BoundingBox === this.POINT) {
        return Maths.pointAndCircleIntersecting(obj2, obj1);
      } else if (obj1BoundingBox === this.POINT && obj2BoundingBox === this.POINT) {
        return Maths.pointsIntersecting(obj1, obj2);
      } else {
        throw "Objects being collision tested have unsupported bounding box types."
      }
    },

    INITIAL: 0,
    SUSTAINED: 1,

    RECTANGLE: 0,
    CIRCLE: 1,
    POINT:2
  };

  var orEqual = function(obj1BB, obj2BB, bBType1, bBType2) {
    return (obj1BB === bBType1 && obj2BB === bBType2) ||
      (obj1BB === bBType2 && obj2BB === bBType1);
  }

  var notifyEntityOfCollision = function(entity, other, type) {
    if (entity.collision !== undefined) {
      entity.collision(other, type);
    }
  };

  var notifyEntityOfUncollision = function(entity, other) {
    if (entity.uncollision !== undefined) {
      entity.uncollision(other);
    }
  };

  var Maths = {
    center: function(obj) {
      if(obj.pos !== undefined) {
        return {
          x: obj.pos.x + (obj.size.x / 2),
          y: obj.pos.y + (obj.size.y / 2),
        };
      }
    },

    circlesIntersecting: function(obj1, obj2) {
      return Maths.distance(Maths.center(obj1), Maths.center(obj2)) <
        obj1.size.x / 2 + obj2.size.x / 2;
    },

    pointAndCircleIntersecting: function(obj1, obj2) {
      return this.distance(obj1.pos, this.center(obj2)) < obj2.size.x / 2;
    },

    pointAndRectangleIntersecting: function(obj1, obj2) {
      return this.pointInsideObj(obj1.pos, obj2);
    },

    pointsIntersecting: function(obj1, obj2) {
      return obj1.pos.x === obj2.pos.x && obj1.pos.y === obj2.pos.y;
    },

    pointInsideObj: function(point, obj) {
      return point.x >= obj.pos.x
        && point.y >= obj.pos.y
        && point.x <= obj.pos.x + obj.size.x
        && point.y <= obj.pos.y + obj.size.y;
    },

    rectanglesIntersecting: function(obj1, obj2) {
      if(obj1.pos.x + obj1.size.x < obj2.pos.x) {
        return false;
      } else if(obj1.pos.x > obj2.pos.x + obj2.size.x) {
        return false;
      } else if(obj1.pos.y > obj2.pos.y + obj2.size.y) {
        return false;
      } else if(obj1.pos.y + obj1.size.y < obj2.pos.y) {
        return false
      } else {
        return true;
      }
    },

    distance: function(point1, point2) {
      var x = point1.x - point2.x;
      var y = point1.y - point2.y;
      return Math.sqrt((x * x) + (y * y));
    },

    rectangleCorners: function(rectangleObj) {
      var corners = [];
      corners.push({ x:rectangleObj.pos.x, y: rectangleObj.pos.y });
      corners.push({ x:rectangleObj.pos.x + rectangleObj.size.x, y:rectangleObj.pos.y });
      corners.push({
        x:rectangleObj.pos.x + rectangleObj.size.x,
        y:rectangleObj.pos.y + rectangleObj.size.y
      });
      corners.push({ x:rectangleObj.pos.x, y: rectangleObj.pos.y + rectangleObj.size.y });
      return corners;
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

    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    unitVector: function(vector) {
      return {
        x: vector.x / Maths.magnitude(vector),
        y: vector.y / Maths.magnitude(vector)
      };
    },

    closestPointOnSeg: function(linePointA, linePointB, circ_pos) {
      var seg_v = Maths.vectorTo(linePointA, linePointB);
      var pt_v = Maths.vectorTo(linePointA, circ_pos);
      if (Maths.magnitude(seg_v) <= 0) {
        throw "Invalid segment length";
      }

      var seg_v_unit = Maths.unitVector(seg_v);
      var proj = Maths.dotProduct(pt_v, seg_v_unit);
      if (proj <= 0) {
        return linePointA;
      } else if (proj >= Maths.magnitude(seg_v)) {
        return linePointB;
      } else {
        return {
          x: linePointA.x + seg_v_unit.x * proj,
          y: linePointA.y + seg_v_unit.y * proj
        };
      }
    },

    isLineIntersectingCircle: function(circleObj, linePointA, linePointB) {
      var circ_pos = {
        x: circleObj.pos.x + circleObj.size.x / 2,
        y: circleObj.pos.y + circleObj.size.y / 2
      };

      var closest = Maths.closestPointOnSeg(linePointA, linePointB, circ_pos);
      var dist_v = Maths.vectorTo(closest, circ_pos);
      return Maths.magnitude(dist_v) < circleObj.size.x / 2;
    },

    circleAndRectangleIntersecting: function(circleObj, rectangleObj) {
      var corners = Maths.rectangleCorners(rectangleObj);
      return Maths.pointInsideObj(Maths.center(circleObj), rectangleObj) ||
        Maths.isLineIntersectingCircle(circleObj, corners[0], corners[1]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[1], corners[2]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[2], corners[3]) ||
        Maths.isLineIntersectingCircle(circleObj, corners[3], corners[0]);
    },
  };

  exports.Collider = Collider;
  exports.Collider.Maths = Maths;
})(typeof exports === 'undefined' ? this.Coquette : exports);
