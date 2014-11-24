;(function(exports) {
  var GOLDEN_RATIO = 1.61803398875;

  var Collisions = function() {
    var autoFocus = false;
    this.c = new Coquette(this, "collisions-canvas",
                          800, 500 / GOLDEN_RATIO, "white", autoFocus);

    var update = this.c.collider.update;

    // Calculate statistics for collision detection
    // by intercepting function calls on the collider.
    this.c.collider.update = function() {
      var scanned   = 0;
      var colliding = 0;

      var isColliding = this.isColliding;
      this.isColliding = function() {
        scanned++;
        var result = isColliding.apply(this, arguments);
        if(result) colliding++
          return result;
      }

      var start = +new Date();
      update.apply(this);
      var end = +new Date();
      var diff = end - start;

      this.isColliding = isColliding;

      collisionStatistics.executionTime(diff);
      collisionStatistics.scannedEntityPairs(scanned);
      collisionStatistics.collidingEntityPairs(colliding);
    }

  };

  Collisions.prototype = {
    update: function() {
      var viewSize = this.c.renderer.getViewSize();
      var viewCenter = this.c.renderer.getViewCenter();

      if (this.c.entities.all().length < 50) { // not enough shapes
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

    mixin(makeCurrentCollidersCountable, this);
  };

  Rectangle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;

      this.angle += this.turnSpeed; // turn
    },

    draw: function(ctx) {
      if (this.colliderCount > 0) {
        ctx.lineWidth = 2;
      } else {
        ctx.lineWidth = 1;
      }

      ctx.strokeStyle = "black";
      ctx.strokeRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                     this.size.x, this.size.y);
    },

  };

  var Circle = function(game, settings) {
    this.c = game.c;
    this.boundingBox = this.c.collider.CIRCLE;
    this.center = settings.center;
    this.size = { x: 55, y: 55 };
    this.vec = settings.vec;

    mixin(makeCurrentCollidersCountable, this);
  };

  Circle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;
    },

    draw: function(ctx) {
      if (this.colliderCount > 0) {
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

  var collisionStatistics = {

    collisionsEl: undefined,
    scannedEl: undefined,
    timeEl: undefined,

    collidingEntityPairs: function(collidingEntities) {
      if(!this.collisionsEl) {
        this.collisionsEl = document.getElementById("collisions");
      }
      this.collisionsEl.innerHTML = collidingEntities;
    },

    scannedEntityPairs: function(scannedEntities) {
      if(!this.scannedEl) {
        this.scannedEl = document.getElementById("scanned");
      }
      this.scannedEl.innerHTML    = scannedEntities;
    },

    executionTime: function(time) {
      if(!this.timeEl) {
        this.timeEl = document.getElementById("time");
      }
      this.timeEl.innerHTML       = time;
    }
  }

  var makeCurrentCollidersCountable = {
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

  exports.Collisions = Collisions;
})(this);
