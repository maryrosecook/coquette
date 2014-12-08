;(function(exports) {

  var width            = 800;
  var height           = 500;

  var shapeSize        = 15;

  var Timer = function() {
    this.size      = 10;
    this.data      = [];
    this.pointer   = 0;
    this.startTime = 0;

    this.timeEl    = undefined;
  }

  Timer.prototype = {
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

  var Test = function(settings) {
    this.time = {};
    this.timer = new Timer();
    this.settings = settings;
    if(settings.quad !== undefined) {
      this.quad = settings.quad;
    }
  }

  Test.prototype.onStartCollisionDetection = function(collider) {
    if(!this.start) {
      collider._useQuadtree(this.quad);
      this.start = +new Date();
    }
    this.timer.start();
  }

  Test.prototype.onEndCollisionDetection = function() {
    this.timer.end();
    var currentTime = +new Date();
    if(currentTime - this.start > this.settings.duration) {
      this.start = undefined;
      if(!this.quad) {
        this.time.all = this.timer.avg();
        this.timer = new Timer();
        this.quad  = true;
      } else {
        this.time.quad = this.timer.avg();
        this.quad = false;
        testSuite.nextTest();
      }
    }
  }

  var TestSuite = function() {
    this.tests = [];
    this.current = 0;

    this.tableEl;
  }

  TestSuite.prototype = {
    addTest: function(test) {
      this.tests.push(test);
    },
    currentTest: function() {
      return this.tests[this.current];
    },
    nextTest: function() {
      this.logTest();
      this.current = ((this.current+1) % this.tests.length);
      return this.currentTest();
    },
    hasNextTest: function() {
      return this.tests.length<this.current+1;
    },
    logTest: function() {
      if(!this.tableEl) {
        this.tableEl = document.getElementById("tests");
      }
      if(this.tableEl.rows.length>this.current+1) {
        this.tableEl.deleteRow(this.current+1);
      }
      var row = this.tableEl.insertRow(this.current+1);

      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      var cell3 = row.insertCell(2);

      // Add some text to the new cells:
      cell1.innerHTML = JSON.stringify(this.currentTest().settings);
      if(this.currentTest().time.all < this.currentTest().time.quad) {
        cell2.innerHTML = "<b>" + this.currentTest().time.all + "ms</b>";
        cell3.innerHTML = this.currentTest().time.quad + "ms";
      } else {
      cell2.innerHTML = this.currentTest().time.all + "ms";
      cell3.innerHTML = "<b>" + this.currentTest().time.quad + "ms</b>";

      }
    }
  };

  var testSuite = new TestSuite();
  [50, 100, 250, 500].forEach(function(count) {
        testSuite.addTest(new Test({entities: count, duration: 5000, quad: false}));
  });

  var Collisions = function() {
    var autoFocus = true;
    var c = new Coquette(this, "collisions-canvas",
                          width, height, "white", autoFocus);
    this.c = c;

    var colliderUpdate = this.c.collider.update;
    this.c.collider.update = function() {
      testSuite.currentTest().onStartCollisionDetection(this);
      colliderUpdate.apply(this);
      testSuite.currentTest().onEndCollisionDetection(this);
    };

    var rendererUpdate = this.c.renderer.update;
    this.c.renderer.update = function(intercal) {
      rendererUpdate.apply(this);
      var ctx = this.getCtx();

      // draw quad tree
      if(this.c.collider.quadTree) {
        drawQuad(this.c.collider.quadTree, ctx);
      }

    }

  };

  Collisions.prototype = {
    entityEl: undefined,

    update: function() {
      var viewSize   = this.c.renderer.getViewSize();
      var viewCenter = this.c.renderer.getViewCenter();

      var x1 = viewCenter.x - viewSize.x/2;
      var x2 = viewCenter.x + viewSize.x/2;
      var y1 = viewCenter.y - viewSize.y/2;
      var y2 = viewCenter.y + viewSize.y/2;

      var entities = this.c.entities.all();
      if(!this.entityEl) {
        this.entityEl = document.getElementById("entities");
      }
      this.entityEl.innerHTML = entities.length;

      var currentTestSettings = testSuite.currentTest().settings;
      // Create if too less
      for(var i=0; i<(currentTestSettings.entities-entities.length); i++) {
        var Shape = Math.random() > 0.5 ? Rectangle : Circle;
        this.c.entities.create(Shape, { // make one
          center: randomPosition(x1, y1, x2, y2),
          vec:    randomVec()
        });
      }

      // Destroy if too many
      for(var i=0; i<(entities.length-currentTestSettings.entities); i++) {
        this.c.entities.destroy(entities[i]);
      }

      // Wrap it!
      this.c.entities.all().forEach(function(entity) {
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
    this.size        = { x: shapeSize*2, y: shapeSize};
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
    this.size        = { x: shapeSize, y: shapeSize };
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

  var levelToColor = ['green', 'red', 'orange', 'yellow', 'brown', 'purple', 'blue'];
  var drawQuad = function(quadtree, ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = levelToColor[quadtree.level-1];
    var x1 = quadtree.x1;
    var y1 = quadtree.y1;
    var x2 = quadtree.x2;
    var y2 = quadtree.y2;
    ctx.strokeRect(x1, y1, x2-x1, y2-y1);
    quadtree.nodes.forEach(function(node) {
      drawQuad(node, ctx);
    });
  }

  var randomPosition = function(x1, y1, x2, y2) {
    var randx = Math.round(Math.random() * (x2-x1) + x1);
    var randy = Math.round(Math.random() * (y2-y1) + y1);
    return { x: randx, y: randy };
  }

  var randomVec = function() {
    var randx = Math.round(Math.random() * 5 - 2.5);
    var randy = Math.round(Math.random() * 5 - 2.5);
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
