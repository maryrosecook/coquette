;(function(exports) {
  var GOLDEN_RATIO = 1.61803398875;

  var SpinningRectanglesGame = function() {
    var autoFocus = false
    this.c = new Coquette(this, "canvas", 500, 500 / GOLDEN_RATIO, "white", autoFocus);
    this.dragger = new Dragger(this.c); // controls dragging of shapes with mouse
  };

  SpinningRectanglesGame.prototype = {
    update: function() {
      this.dragger.update();
      if (this.c.entities.all().length < 10) {
        var viewSize = this.c.renderer.getViewSize();
        var Shape = Math.random() > 0.5 ? Rectangle : Circle;
        this.c.entities.create(Shape, { // make one
          center: { x: Math.random() * viewSize.x, y: Math.random() * viewSize.y }
        });
      }

      // destroy entities that are off screen
      var entities = this.c.entities.all();
      for (var i = 0; i < entities.length; i++) {
        if (!this.c.renderer.onScreen(entities[i])) {
          this.c.entities.destroy(entities[i]);
        }
      }
    },
  };

  var Rectangle = function(game, settings) {
    this.c = game.c;
    this.angle = Math.random() * 360;
    this.center = settings.center;
    this.size = { x: 0, y: 0 }; // slowly grows

    this.vec = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
    this.turnSpeed = 2 * Math.random() - 1;

    mixin(countCurrentColliders, this);
  };

  Rectangle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;
      this.angle += this.turnSpeed;

      // grow until full size
      if (this.size.x < 70) {
        this.size.x += 2;
        this.size.y += 2 / GOLDEN_RATIO;
      }
    },

    draw: function(ctx) {
      if (this.colliderCount > 0) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                       this.size.x, this.size.y);


      } else {
        ctx.strokeStyle = "#aaa";
        ctx.strokeRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                       this.size.x, this.size.y);
      }
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
    this.size = { x: 0, y: 0 }; // slowly grows

    this.vec = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };

    mixin(countCurrentColliders, this);
  };

  Circle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;

      // grow until full size
      if (this.size.x < 55) {
        this.size.x = this.size.y = this.size.x + 2;
      }
    },

    draw: function(ctx) {
      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();

      if (this.colliderCount > 0) {
        ctx.strokeStyle = "black";
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#aaa";
        ctx.stroke();
      }
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
      if (self.isDragging()) {
        self._currentDrag.target.center = {
          x: e.x + self._currentDrag.centerOffset.x,
          y: e.y + self._currentDrag.centerOffset.y
        };
      }
    });
  };

  Dragger.prototype = {
    update: function() {
      if (this.c.inputter.isDown(this.c.inputter.LEFT_MOUSE)) {
        if (!this.isDragging()) {
          var mousePosition = this.c.inputter.getMousePosition();
          var target = this._getTarget(this.c.entities.all(), mousePosition)
          if (target !== undefined) {
            this._startDrag(target, mousePosition);
          }
        }
      } else {
        this._stopDrag();
      }
    },

    isDragging: function() {
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

      target.startDrag();
    },

    _stopDrag: function() {
      if (this.isDragging()) {
        this._currentDrag = undefined;
      }
    }
  };

  var mixin = function(from, to) {
    for (var i in from) {
      to[i] = from[i];
    }
  };

  var countCurrentColliders = {
    colliderCount: 0, // number of other shapes currently touching this shape

    collision: function(_, type) {
      if (type === this.c.collider.INITIAL) {
        this.colliderCount++;
      }
    },

    uncollision: function() {
      this.colliderCount--;
    }
  };

  exports.SpinningRectanglesGame = SpinningRectanglesGame;
})(this);
