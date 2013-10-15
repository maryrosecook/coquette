require('../src/within')
require('../src/renderer');
require('../src/collider');
require('../src/entities');
require('../src/runner');

within("coquette.maryrosecook.com", function() {
  var
    Renderer = this.Renderer,
    Collider = this.Collider,
    Entities = this.Entities,
    Runner = this.Runner;

  var MockContext = function() {
    this.translate = function() {};
    this.fillRect = function() {};
  };

  var MockCanvas = function() {
    this.style = {};
    this.ctx = new MockContext();
    this.getContext = function() { return this.ctx; };
  };

  var MockCoquette = function() {
    this.entities = new Entities(this);
    this.runner = new Runner(this);
    this.renderer = new Renderer(this, {}, new MockCanvas());
  };

  describe('entities', function() {
    describe('zindex', function() {
      var Entity = function(_, settings) {
        for (var i in settings) {
          this[i] = settings[i];
        }
      };

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
          x: r.getViewCenterPos().x - r.getViewSize().x / 2,
          y: r.getViewCenterPos().y - r.getViewSize().y / 2
        }).toEqual({ x: 0, y: 0 });
      });

      it('should be able to get view center with getViewCenterPos()', function() {
        var r = new Renderer(null, null, new MockCanvas(), 200, 100);
        expect({
          x: r.getViewCenterPos().x - r.getViewSize().x / 2,
          y: r.getViewCenterPos().y - r.getViewSize().y / 2
        }).toEqual({ x: 0, y: 0 });
      });

      describe('setViewCenterPos()', function() {
        it('should be able to set view center', function() {
          var r = new Renderer(null, null, new MockCanvas());
          r.setViewCenterPos({ x: 10, y: 12 });
          expect(r.getViewCenterPos()).toEqual({ x: 10, y: 12 });
        });

        it('should make new obj to hold set pos', function() {
          var r = new Renderer(null, null, new MockCanvas());
          var newPos = { x: 10, y: 12 };
          r.setViewCenterPos(newPos);
          expect(r.getViewCenterPos()).toEqual({ x: 10, y: 12 });
          newPos.x = 15;
          expect(r.getViewCenterPos()).toEqual({ x: 10, y: 12 });
        });
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
        expect(r.backgroundColor).toEqual("#aaa");
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
});
