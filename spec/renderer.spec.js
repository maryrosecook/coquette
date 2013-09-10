var Renderer = require('../src/renderer').Renderer;
var Collider = require('../src/collider').Collider;

var MockContext = function() {};

var MockCanvas = function() {
  this.style = {};
  this.ctx = new MockContext();
  this.getContext = function() { return this.ctx; };
};

describe('renderer', function() {
  describe('view center position', function() {
    it('should default view center to 0 0', function() {
      var r = new Renderer(null, null, new MockCanvas());
      expect(r.getViewCenterPos()).toEqual({ x: 0, y: 0 });
    });

    it('should be able to get view center with getViewCenterPos()', function() {
      var r = new Renderer(null, null, new MockCanvas());
      expect(r.getViewCenterPos()).toEqual({ x: 0, y: 0 });
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
