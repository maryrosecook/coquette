;(function(exports) {
  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    coquette = this;
    this.renderer = new Coquette.Renderer(canvasId, width, height, backgroundColor);
    this.inputter = new Coquette.Inputter(canvasId, autoFocus);
    this.updater = new Coquette.Updater();
    this.entities = new Coquette.Entities();
    this.runner = new Coquette.Runner();
    this.collider = new Coquette.Collider();

    this.updater.add(this.collider);
    this.updater.add(this.runner);
    this.updater.add(this.renderer);
    this.updater.add(game);
    this.game = game;
  };

  var coquette;
  Coquette.get = function() {
    return coquette;
  };

  exports.Coquette = Coquette;
})(this);

;(function(exports) {
  var Collider = function() {};

  Collider.prototype = {
    collideRecords: [],

    update: function() {
      var ent = Coquette.get().entities.all();
      for (var i = 0, len = ent.length; i < len; i++) {
        for (var j = i; j < len; j++) {
          if (ent[i] !== ent[j]) {
            if (Maths.isIntersecting(ent[i], ent[j])) {
              this.collision(ent[i], ent[j]);
            } else {
              this.removeOldCollision(ent[i], ent[j]);
            }
          }
        }
      }
    },

    collision: function(entity1, entity2) {
      if (this.getCollideRecord(entity1, entity2) === undefined) {
        this.collideRecords.push([entity1, entity2]);
        notifyEntityOfCollision(entity1, entity2, this.INITIAL);
        notifyEntityOfCollision(entity2, entity1, this.INITIAL);
      } else {
        notifyEntityOfCollision(entity1, entity2, this.SUSTAINED);
        notifyEntityOfCollision(entity2, entity1, this.SUSTAINED);
      }
    },

    removeEntity: function(entity) {
      this.removeOldCollision(entity);
    },

    // if passed entities recorded as colliding in history record, remove that record
    removeOldCollision: function(entity1, entity2) {
      var recordId = this.getCollideRecord(entity1, entity2);
      if (recordId !== undefined) {
        var record = this.collideRecords[recordId];
        notifyEntityOfUncollision(record[0], record[1])
        notifyEntityOfUncollision(record[1], record[0])
        this.collideRecords.splice(recordId, 1);
      }
    },

    getCollideRecord: function(entity1, entity2) {
      for (var i = 0, len = this.collideRecords.length; i < len; i++) {
        // looking for coll where one entity appears
        if (entity2 === undefined &&
            (this.collideRecords[i][0] === entity1 ||
             this.collideRecords[i][1] === entity1)) {
          return i;
        // looking for coll between two specific entities
        } else if (this.collideRecords[i][0] === entity1 &&
                   this.collideRecords[i][1] === entity2) {
          return i;
        }
      }
    },

    INITIAL: 0,
    SUSTAINED: 1,

    RECTANGLE: 0,
    CIRCLE: 1
  };

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

    isIntersecting: function(obj1, obj2) {
      var obj1BoundingBox = obj1.boundingBox || Coquette.get().collider.RECTANGLE;
      var obj2BoundingBox = obj2.boundingBox || Coquette.get().collider.RECTANGLE;
      if (obj1BoundingBox === Coquette.get().collider.RECTANGLE &&
          obj2BoundingBox === Coquette.get().collider.RECTANGLE) {
        return Maths.rectanglesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === Coquette.get().collider.CIRCLE &&
                 obj2BoundingBox === Coquette.get().collider.CIRCLE) {
        return Maths.circlesIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === Coquette.get().collider.CIRCLE) {
        return Maths.circleAndRectangleIntersecting(obj1, obj2);
      } else if (obj1BoundingBox === Coquette.get().collider.RECTANGLE) {
        return Maths.circleAndRectangleIntersecting(obj2, obj1);
      } else {
        throw "Objects being collision tested have unsupported bounding box types."
      }
    },

    circlesIntersecting: function(obj1, obj2) {
      return Maths.distance(Maths.center(obj1), Maths.center(obj2)) <
        obj1.size.x / 2 + obj2.size.x / 2;
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

 ;(function(exports) {
  var Inputter = function(canvasId, autoFocus) {
    if (autoFocus === undefined) {
      autoFocus = true;
    }

    var inputReceiverElement = window;
    if (!autoFocus) {
      inputReceiverElement = document.getElementById(canvasId)
      inputReceiverElement.contentEditable = true; // lets canvas get focus and get key events
    } else {
      // suppress scrolling
      window.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
          e.preventDefault();
        }
      }, false);
    }

    inputReceiverElement.addEventListener('keydown', this.keydown.bind(this), false);
    inputReceiverElement.addEventListener('keyup', this.keyup.bind(this), false);
  };

  Inputter.prototype = {
    _state: {},
    bindings: {},

    state: function(keyCode, state) {
      if (state !== undefined) {
        this._state[keyCode] = state;
      } else {
        return this._state[keyCode] || false;
      }
    },

    keydown: function(e) {
      this.state(e.keyCode, true);
    },

    keyup: function(e) {
      this.state(e.keyCode, false);
    },

    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    SPACE: 32
  };
  exports.Inputter = Inputter;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  function Runner() {
    this.runs = [];
  };

  Runner.prototype = {
    update: function() {
      this.run();
    },

    run: function() {
      while(this.runs.length > 0) {
        var run = this.runs.pop();
        run.fn(run.obj);
      }
    },

    add: function(obj, fn) {
      this.runs.push({
        obj: obj,
        fn: fn
      });
    }
  };

  exports.Runner = Runner;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var interval = 16;

  function Updater() {
    setupRequestAnimationFrame();
    this.updatees = [];
    this.tick = interval;
    this.prev = new Date().getTime();

    var self = this;
    var update = function() {
      var now = new Date().getTime();
      self.tick = now - self.prev;
      self.prev = now;

      // call update fns
      for (var i = 0; i < self.updatees.length; i++) {
        if (self.updatees[i].update !== undefined) {
          self.updatees[i].update();
        }
      }

      // call draw fns
      for (var i = 0; i < self.updatees.length; i++) {
        if (self.updatees[i].draw !== undefined) {
          self.updatees[i].draw();
        }
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  Updater.prototype = {
    add: function(updatee) {
      this.updatees.push(updatee);
    },

    remove: function(updatee) {
      for(var i = 0; i < this.updatees.length; i++) {
        if(this.updatees[i] === updatee) {
          this.updatees.splice(i, 1);
          break;
        }
      }
    }
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

  exports.Updater = Updater;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  var Renderer = function(canvasId, width, height, backgroundColor) {
    var canvas = document.getElementById(canvasId);
    canvas.style.outline = "none"; // stop browser outlining canvas when it has focus
    canvas.style.cursor = "default"; // keep pointer normal when hovering over canvas
    this.ctx = canvas.getContext('2d');
    this.backgroundColor = backgroundColor;
    canvas.width = this.width = width;
    canvas.height = this.height = height;
  };

  Renderer.prototype = {
    getCtx: function() {
      return this.ctx;
    },

    update: function() {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    },

    center: function() {
      return {
        x: this.width / 2,
        y: this.height / 2
      };
    },

    onScreen: function(obj) {
      return obj.pos.x > 0 && obj.pos.x < Coquette.get().renderer.width &&
        obj.pos.y > 0 && obj.pos.y < Coquette.get().renderer.height;
    }
  };

  exports.Renderer = Renderer;
})(typeof exports === 'undefined' ? this.Coquette : exports);

;(function(exports) {
  function Entities() {
    this._entities = [];
  };

  Entities.prototype = {
    all: function(clazz) {
      if (clazz === undefined) {
        return this._entities;
      } else {
        var entities = [];
        for (var i = 0; i < this._entities.length; i++) {
          if (this._entities[i] instanceof clazz) {
            entities.push(this._entities[i]);
          }
        }

        return entities;
      }
    },

    create: function(clazz, settings, callback) {
      Coquette.get().runner.add(this, function(entities) {
        var entity = new clazz(Coquette.get().game, settings || {});
        Coquette.get().updater.add(entity);
        entities._entities.push(entity);
        if (callback !== undefined) {
          callback(entity);
        }
      });
    },

    destroy: function(entity, callback) {
      Coquette.get().runner.add(this, function(entities) {
        Coquette.get().updater.remove(entity);
        entity._killed = true;
        Coquette.get().updater.remove(entity);
        for(var i = 0; i < entities._entities.length; i++) {
          if(entities._entities[i] === entity) {
            entities._entities.splice(i, 1);
            if (callback !== undefined) {
              callback();
            }
            break;
          }
        }
      });
    }
  };

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);

