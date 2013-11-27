;(function(exports) {
  var GOLDEN_RATIO = 1.61803398875;

  var SpinningRectanglesGame = function() {
    var autoFocus = false
    this.c = new Coquette(this, "canvas", 500, 500 / GOLDEN_RATIO, "white", autoFocus);
  };

  SpinningRectanglesGame.prototype = {
    update: function() {
      // if not enough shapes, create another one
      // if (this.c.entities.all().length < 7) {
      //   var Constructor = Math.random() > 0.5 ? Circle : Rectangle;
      //   var viewSize = this.c.renderer.getViewSize();
      //   this.c.entities.create(Constructor, { // make one
      //     center: { x: Math.random() * viewSize.x, y: Math.random() * viewSize.y }
      //   });
      // }

      if (this.c.entities.all(Rectangle).length < 6) {
        var viewSize = this.c.renderer.getViewSize();
        this.c.entities.create(Rectangle, { // make one
          center: { x: Math.random() * viewSize.x, y: Math.random() * viewSize.y }
        });
      }

      if (this.c.entities.all(Circle).length < 6) {
        var viewSize = this.c.renderer.getViewSize();
        this.c.entities.create(Circle, { // make one
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

    draw: function(ctx) {
      var circle = this.c.entities.all(Circle)[0];
      var rectangle = this.c.entities.all(Rectangle)[0];
      if (circle && rectangle) {
        // var rectangleToCircleVector = Coquette.Collider.Maths.vectorTo(rectangle.center,
        //                                                                circle.center);
        // ctx.strokeStyle = "red";
        // ctx.beginPath();
        // ctx.moveTo(rectangle.center.x, rectangle.center.y);
        // ctx.lineTo(rectangle.center.x + rectangleToCircleVector.x,
        //            rectangle.center.y + rectangleToCircleVector.y)
        // ctx.closePath();
        // ctx.stroke();

        var m = Coquette.Collider.Maths;
        var rectangleToCircleVector = m.vectorTo(rectangle.center, circle.center);
        var rectangleToCircleVectorNormalised = m.unitVector(rectangleToCircleVector);
        var rectangleCorners = m.sat.rectangleCorners(rectangle);
        for (var i = 0; i < 3; i++) {
          var v = m.vectorTo(rectangleCorners[i], rectangle.center);
          // var currentMax = m.dotProduct(v, rectangleToCircleVectorNormalised);
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.moveTo(rectangle.center.x, rectangle.center.y);
          ctx.lineTo(rectangle.center.x + v.x,
                     rectangle.center.y + v.y)
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  };

  var Rectangle = function(game, settings) {
    this.c = game.c;
    this.angle = 0;
    this.center = settings.center;
    this.size = { x: 0, y: 0 }; // slowly grows

    this.vec = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
    this.turnSpeed = 2 * Math.random() - 1;

    this.colliderCount = 0; // number of other boxes currently touching this rectangle
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
        ctx.fillStyle = "black";
        ctx.fillRect(this.center.x - this.size.x / 2, this.center.y - this.size.y / 2,
                     this.size.x, this.size.y);
      }
    },

    collision: function(_, type) {
      if (type === this.c.collider.INITIAL) {
        this.colliderCount++;
      }
    },

    uncollision: function() {
      this.colliderCount--;
    }
  };

  var Circle = function(game, settings) {
    this.c = game.c;
    this.boundingBox = this.c.collider.CIRCLE;
    this.center = settings.center;
    this.size = { x: 0, y: 0 }; // slowly grows

    this.vec = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };

    this.colliderCount = 0; // number of other boxes currently touching this rectangle
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

      // if (this.colliderCount > 0) {
        ctx.strokeStyle = "black";
        ctx.stroke();
      // } else {
      //   ctx.fillStyle = "black";
      //   ctx.fill();
      // }


    },

    collision: function(_, type) {
      if (type === this.c.collider.INITIAL) {
        this.colliderCount++;
      }
    },

    uncollision: function() {
      this.colliderCount--;
    }
  }

  exports.SpinningRectanglesGame = SpinningRectanglesGame;
})(this);
