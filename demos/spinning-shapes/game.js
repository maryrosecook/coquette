;(function(exports) {
  var GOLDEN_RATIO = 1.61803398875;

  var SpinningShapesGame = function() {
    var autoFocus = false;
    this.c = new Coquette(this, "spinning-shapes-canvas",
                          500, 500 / GOLDEN_RATIO, "white", autoFocus);
    this.dragger = new Dragger(this.c); // controls dragging of shapes with mouse
  };

  SpinningShapesGame.prototype = {
    update: function() {
      this.dragger.update();
      var viewSize = this.c.renderer.getViewSize();
      var viewCenter = this.c.renderer.getViewCenter();

      if (this.c.entities.all().length < 15) { // not enough shapes
        var dirFromCenter = randomDirection();
        var Shape = Math.random() > 0.5 ? Rectangle : Circle;
        this.c.entities.create(Shape, { // make one
          center: offscreenPosition(dirFromCenter, viewSize, viewCenter),
          vec: movingOnscreenVec(dirFromCenter)
        });
      }

      // destroy entities that are off screen
      var entities = this.c.entities.all();
      for (var i = 0; i < entities.length; i++) {
        if (isOutOfView(entities[i], viewSize, viewCenter)) {
          this.c.entities.destroy(entities[i]);
        }
      }
    },
  };

  var Rectangle = function(game, settings) {
    this.c = game.c;
    this.angle = Math.random() * 360;
    this.center = settings.center;
    this.size = { x: 70, y: 70 / GOLDEN_RATIO };
    this.vec = settings.vec;
    this.turnSpeed = 2 * Math.random() - 1;

    this.collisionCounter = new CollisionCounter(this);
  };

  Rectangle.prototype = {
    update: function() {
      this.collisionCounter.update();

      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;

      this.angle += this.turnSpeed; // turn
    },

    draw: function(ctx) {
      if (this.collisionCounter.colliders.length > 0) {
        ctx.lineWidth = 2;
      } else {
        ctx.lineWidth = 1;
      }

      ctx.strokeStyle = "black";
      ctx.strokeRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                     this.size.x, this.size.y);
    },

    collision: function(other) {
      this.collisionCounter.collision(other);
    },

    startDrag: function() {
      this.vec = { x: 0, y: 0 };
      this.turnSpeed = 0;
    }
  };

  var Circle = function(game, settings) {
    this.c = game.c;
    this.boundingBox = this.c.collider.CIRCLE;
    this.center = settings.center;
    this.size = { x: 55, y: 55 };
    this.vec = settings.vec;

    this.collisionCounter = new CollisionCounter(this);
  };

  Circle.prototype = {
    update: function() {
      this.collisionCounter.update();

      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;
    },

    draw: function(ctx) {
      if (this.collisionCounter.colliders.length > 0) {
        ctx.lineWidth = 2;
      } else {
        ctx.lineWidth = 1;
      }

      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.strokeStyle = "black";
      ctx.stroke();
    },

    collision: function(other) {
      this.collisionCounter.collision(other);
    },

    startDrag: function() {
      this.vec = { x: 0, y: 0 };
    }
  };

  var Dragger = function(c) {
    this.c = c;
    this._currentDrag;
    var self = this;

    c.inputter.bindMouseMove(function(e) {
      if (c.inputter.isDown(c.inputter.LEFT_MOUSE)) {
        if (self._isDragging()) {
          self._currentDrag.target.center = {
            x: e.x + self._currentDrag.centerOffset.x,
            y: e.y + self._currentDrag.centerOffset.y
          };
        }
      }
    });
  };

  Dragger.prototype = {
    update: function() {
      if (this.c.inputter.isDown(this.c.inputter.LEFT_MOUSE)) {
        if (!this._isDragging()) {
          var mousePosition = this.c.inputter.getMousePosition();
          var target = this._getTarget(this.c.entities.all(), mousePosition);
          if (target !== undefined) {
            this._startDrag(target, mousePosition);
          }
        }
      } else {
        this._stopDrag();
      }
    },

    _isDragging: function() {
      return this._currentDrag !== undefined;
    },

    _getTarget: function(targets, e) {
      for (var i = 0; i < targets.length; i++) {
        if (Coquette.Collider.Maths.pointInsideObj(e, targets[i])) {
          return targets[i];
        }
      }
    },

    _startDrag: function(target, e) {
      this._currentDrag = {
        target: target,
        centerOffset: {
          x: target.center.x - e.x,
          y: target.center.y - e.y
        }
      };

      if (target.startDrag !== undefined) {
        target.startDrag();
      }
    },

    _stopDrag: function() {
      if (this._isDragging()) {
        if (this._currentDrag.target.stopDrag !== undefined) {
          this._currentDrag.target.stopDrag();
        }

        this._currentDrag = undefined;
      }
    }
  };

  var randomDirection = function() {
    return Coquette.Collider.Maths.unitVector({ x:Math.random() - .5, y:Math.random() - .5 });
  };

  var movingOnscreenVec = function(dirFromCenter) {
    return { x: -dirFromCenter.x * 3 * Math.random(), y: -dirFromCenter.y * 3 * Math.random() }
  };

  var offscreenPosition = function(dirFromCenter, viewSize, viewCenter) {
    return {
      x: viewCenter.x + dirFromCenter.x * viewSize.x,
      y: viewCenter.y + dirFromCenter.y * viewSize.y,
    };
  };

  var isOutOfView = function(obj, viewSize, viewCenter) {
    return Coquette.Collider.Maths.distance(obj.center, viewCenter) >
      Math.max(viewSize.x, viewSize.y);
  };

  var mixin = function(from, to) {
    for (var i in from) {
      to[i] = from[i];
    }
  };

  var CollisionCounter = function(entity) {
    this.colliders = [];

    this.update = function() {
      this.colliders = this.colliders
        .filter(function(c) { return entity.c.collider.isColliding(entity, c); });
    };

    this.collision = function(other) {
      if (this.colliders.indexOf(other) === -1) {
        this.colliders.push(other);
      }
    };
  };

  exports.SpinningShapesGame = SpinningShapesGame;
})(this);
