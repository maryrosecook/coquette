var Renderer = require('../src/renderer').Renderer;
var Collider = require('../src/collider').Collider;
var Entities = require('../src/entities').Entities;
var Runner = require('../src/runner').Runner;

var MockContext = function() {
  this.translate = function() {};
  this.fillRect = function() {};
  this.save = function() {};
  this.restore = function() {}
};

var MockCanvas = function() {
  this.style = {};
  this.ctx = new MockContext();
  this.getContext = function() { return this.ctx; };
};

var MockCoquette = function() {
  this.entities = new Entities(this);
  this.runner = new Runner(this);
  this.collider = new Collider(this);
  this.renderer = new Renderer(this, {}, new MockCanvas(), 100, 200);
};

var Entity = function(_, settings) {
  for (var i in settings) {
    this[i] = settings[i];
  }
};

describe('entities', function() {
  describe('zindex', function() {
    var coquette;
    beforeEach(function() {
      coquette = new MockCoquette();
    });

    it('should sort entities with zindex vars lowest to highest', function() {
      var callOrder = 0;
      var recordDrawCall = function() {
        this.callOrder = callOrder++;
      };

      coquette.entities.create(Entity, { zindex: -1, draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: -20, draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: 0, draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: 21, draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: 9, draw: recordDrawCall });

      coquette.runner.update();
      coquette.renderer.update();

      expect(coquette.entities.all()[0].callOrder).toEqual(1);
      expect(coquette.entities.all()[1].callOrder).toEqual(0);
      expect(coquette.entities.all()[2].callOrder).toEqual(2);
      expect(coquette.entities.all()[3].callOrder).toEqual(4);
      expect(coquette.entities.all()[4].callOrder).toEqual(3);
    });

    it('should sort entities w/o zindex as 0', function() {
      var callOrder = 0;
      var recordDrawCall = function() {
        this.callOrder = callOrder++;
      };

      coquette.entities.create(Entity, { zindex: -1, draw: recordDrawCall });
      coquette.entities.create(Entity, { draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: 21, draw: recordDrawCall });
      coquette.entities.create(Entity, { draw: recordDrawCall });
      coquette.entities.create(Entity, { zindex: 0, draw: recordDrawCall });

      coquette.runner.update();
      coquette.renderer.update();

      expect(coquette.entities.all()[0].callOrder).toEqual(0);
      expect(coquette.entities.all()[1].callOrder).toEqual(3);
      expect(coquette.entities.all()[2].callOrder).toEqual(4);
      expect(coquette.entities.all()[3].callOrder).toEqual(2);
      expect(coquette.entities.all()[4].callOrder).toEqual(1);
    });
  });

  describe('view center position', function() {
    it('should default view top left to 0 0', function() {
      var r = new Renderer(null, null, new MockCanvas(), 200, 100);
      expect({
        x: r.getViewCenter().x - r.getViewSize().x / 2,
        y: r.getViewCenter().y - r.getViewSize().y / 2
      }).toEqual({ x: 0, y: 0 });
    });

    it('should be able to get view center with getViewCenter()', function() {
      var r = new Renderer(null, null, new MockCanvas(), 200, 100);
      expect({
        x: r.getViewCenter().x - r.getViewSize().x / 2,
        y: r.getViewCenter().y - r.getViewSize().y / 2
      }).toEqual({ x: 0, y: 0 });
    });

    describe('setViewCenter()', function() {
      it('should be able to set view center', function() {
        var r = new Renderer(null, null, new MockCanvas());
        r.setViewCenter({ x: 10, y: 12 });
        expect(r.getViewCenter()).toEqual({ x: 10, y: 12 });
      });

      it('should make new obj to hold set pos', function() {
        var r = new Renderer(null, null, new MockCanvas());
        var newPos = { x: 10, y: 12 };
        r.setViewCenter(newPos);
        expect(r.getViewCenter()).toEqual({ x: 10, y: 12 });
        newPos.x = 15;
        expect(r.getViewCenter()).toEqual({ x: 10, y: 12 });
      });
    });
  });

  describe('rotation of entities drawings', function() {
    it('should rotate to angle of entity before drawing', function() {
      var coquette = new MockCoquette();
      coquette.renderer._ctx = new MockContext();

      var testEvents = [];

      coquette.renderer._ctx.rotate = function(angle) {
        testEvents.push({ event: "rotate", angle: angle });
      };

      var recordDrawCall = function() {
        testEvents.push({ event: "draw", angle: this.angle });
      };

      coquette.entities.create(Entity, { angle: 0, center: { x: 0, y: 0 }, draw: recordDrawCall });
      coquette.entities.create(Entity, { angle: 180, center: { x: 0, y: 0 }, draw: recordDrawCall });
      coquette.runner.update();
      coquette.renderer.update();

      expect(testEvents[0]).toEqual({ event: "rotate", angle: 3.141 });
      expect(testEvents[1]).toEqual({ event: "draw", angle: 180 });
      expect(testEvents[2]).toEqual({ event: "rotate", angle: 0 });
      expect(testEvents[3]).toEqual({ event: "draw", angle: 0 });
    });

    it('should only rotate if center and angle on entity', function() {
      var coquette = new MockCoquette();
      expect(function() {
        coquette.entities.create(Entity, { angle: 0, center: { x: 0, y: 0 }, draw: function() {} });
        coquette.runner.update();
        coquette.renderer.update();
      }).toThrow("Object [object Object] has no method 'rotate'")

      var coquette = new MockCoquette();
      coquette.entities.create(Entity, { angle: 0, draw: function() {} });
      coquette.runner.update();
      coquette.renderer.update(); // will not throw

      var coquette = new MockCoquette();
      coquette.entities.create(Entity, { center: { x: 0, y: 0 }, draw: function() {} });
      coquette.runner.update();
      coquette.renderer.update(); // will not throw
    });
  });

  describe('centering on view center position', function() {
    it('should center on view center before drawing', function() {
      var coquette = new MockCoquette();
      coquette.renderer._ctx = new MockContext();

      var translations = [];
      coquette.renderer._ctx.translate = function(inX, inY) {
        translations.push({ x: inX, y: inY });
      };

      coquette.renderer.setViewCenter({ x: 10, y: 20 });
      coquette.renderer.update();
      expect(translations[0]).toEqual({ x: 40, y: 80 });
    });

    it('should center on view center before drawing', function() {
      var coquette = new MockCoquette();
      coquette.renderer._ctx = new MockContext();

      var translations = [];
      coquette.renderer._ctx.translate = function(inX, inY) {
        translations.push({ x: inX, y: inY });
      };

      coquette.renderer.setViewCenter({ x: 10, y: 20 });
      coquette.renderer.update();
      expect(translations[1]).toEqual({ x: -40, y: -80 });
    });
  });

  describe('getCtx()', function() {
    it('should return ctx', function() {
      var r = new Renderer(null, null, new MockCanvas());
      expect(r.getCtx() instanceof MockContext).toEqual(true);
    });
  });

  describe('background color', function() {
    it('should set background color to passed color', function() {
      var r = new Renderer(null, null, new MockCanvas(), null, null, "#aaa");
      expect(r._backgroundColor).toEqual("#aaa");
    });
  });

  describe('view size', function() {
    it('should set view size to passed vals', function() {
      var r = new Renderer(null, null, new MockCanvas(), 100, 200);
      expect(r.getViewSize()).toEqual({ x: 100, y: 200 });
    });

    it('should set width and height of canvas to passed view size', function() {
      var canvas = new MockCanvas();
      var r = new Renderer(null, null, canvas, 100, 200);
      expect(canvas.width).toEqual(100);
      expect(canvas.height).toEqual(200);
    });

    it('should be able to get view size with getViewSize()', function() {
      var r = new Renderer(null, null, new MockCanvas(), 100, 200);
      expect(r.getViewSize()).toEqual({ x: 100, y: 200 });
    });
  });

  describe('onScreen()', function() {
    it('should return true for on screen entity', function() {
      // Unorthodox test that just checks the rectanglesIntersecting() fn is used
      // for the onScreen functionality.  Then can just rely on the comprehensive tests
      // of that fn in collider.spec.js
      var oldRectanglesIntersecting = Collider.Maths.rectanglesIntersecting;

      var ran = false;
      Collider.Maths.rectanglesIntersecting = function() {
        ran = true;
      };

      expect(ran).toEqual(false);
      new Renderer(null, null, new MockCanvas()).onScreen();
      expect(ran).toEqual(true);
    });
  });
});
