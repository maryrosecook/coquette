;(function(exports) {

  var maxNumberOfShape = 100;
  var width            = 800;
  var height           = 500;


  var time = {
    size:      10,
    data:      [],
    pointer:   0,
    startTime: 0,

    timeEl: undefined,

    start: function() {
      this.startTime = +new Date();
    },

    end: function() {
      var endTime = +new Date();
      this.add(endTime - this.startTime);

      if(!this.timeEl) {
        this.timeEl = document.getElementById("time");
      }
      this.timeEl.innerHTML = this.avg();
    },

    add: function(diff) {
      this.data[this.pointer] = diff;
      this.pointer = ++this.pointer % this.size;
    },

    avg: function() {
      var sum = 0;
      this.data.forEach(function(time) {
        sum += time;
      });
      return Math.round(sum/this.data.length);
    }
  }

  var Collisions = function() {
    var autoFocus = true;
    var c = new Coquette(this, "collisions-canvas",
                          width, height, "white", autoFocus);
    this.c = c;

    // Measuring time for calculating collisions
    var update = this.c.collider.update;
    this.c.collider.update = function() {
      time.start();
      update.apply(this);
      time.end();
    };

  };

  Collisions.prototype = {
    entityEl: undefined,

    update: function() {
      var viewSize   = this.c.renderer.getViewSize();
      var viewCenter = this.c.renderer.getViewCenter();

      if (this.c.inputter.isPressed(this.c.inputter.SPACE)) {
        this.c.collider._toggleCollisionStrategy();
      }

      var x1 = viewCenter.x - viewSize.x/2;
      var x2 = viewCenter.x + viewSize.x/2;
      var y1 = viewCenter.y - viewSize.y/2;
      var y2 = viewCenter.y + viewSize.y/2;

      var entities = this.c.entities.all();
      if(!this.entityEl) {
        this.entityEl = document.getElementById("entities");
      }
      this.entityEl.innerHTML = entities.length;

      if (entities.length < maxNumberOfShape) { // not enough shapes
        var Shape = Math.random() > 0.5 ? Rectangle : Circle;
        this.c.entities.create(Shape, { // make one
          center: randomPosition(x1, y1, x2, y2),
          vec:    randomVec()
        });
      }

      this.c.entities.all().forEach(function(entity) {
        // Wrap it!
        if(entity.center.x > x2) entity.center.x = x1;
        if(entity.center.x < x1) entity.center.x = x2;
        if(entity.center.y > y2) entity.center.y = y1;
        if(entity.center.y < y1) entity.center.y = y2;
      });
    },
  };

  var Rectangle = function(game, settings) {
    this.c           = game.c;
    this.boundingBox = new Coquette.Collider.Shape.Rectangle(this);
    this.angle       = Math.random() * 360;
    this.center      = settings.center;
    this.size        = { x: 20, y: 10};
    this.vec         = settings.vec;
    this.turnSpeed   = 2 * Math.random() - 1;

    mixin(makeCurrentCollidersCountable, this);
  };

  Rectangle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;

      this.angle += this.turnSpeed; // turn
      this.lineWidth = this.colliderCount>0 ? 2 : 1;
      this.colliderCount = 0;
    },

    draw: function(ctx) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = this.lineWidth;
      ctx.strokeRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                     this.size.x, this.size.y);
    },

  };

  var Circle = function(game, settings) {
    this.c           = game.c;
    this.boundingBox = new Coquette.Collider.Shape.Circle(this);
    this.center      = settings.center;
    this.size        = { x: 10, y: 10 };
    this.vec         = settings.vec;

    mixin(makeCurrentCollidersCountable, this);
  };

  Circle.prototype = {
    update: function() {
      // move
      this.center.x += this.vec.x;
      this.center.y += this.vec.y;

      this.lineWidth = this.colliderCount>0 ? 2 : 1;
      this.colliderCount = 0;
    },

    draw: function(ctx) {
      ctx.beginPath();
      ctx.lineWidth = this.lineWidth;
      ctx.arc(this.center.x, this.center.y, this.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.strokeStyle = "black";
      ctx.stroke();
    },

  };

  var randomPosition = function(x1, y1, x2, y2) {
    var randx = Math.round(Math.random() * (x2-x1) + x1);
    var randy = Math.round(Math.random() * (y2-y1) + y1);
    return { x: randx, y: randy };
  }

  var randomVec = function() {
    var randx = Math.round(Math.random() * 10 - 5);
    var randy = Math.round(Math.random() * 10 - 5);
    return { x: randx, y: randy };
  }

  var mixin = function(from, to) {
    for (var i in from) {
      to[i] = from[i];
    }
  };

  var makeCurrentCollidersCountable = {
    colliderCount: 0, // number of other shapes currently touching this shape

    collision: function(_, type) {
      this.colliderCount++;
    },

  };

  exports.Collisions = Collisions;
})(this);
