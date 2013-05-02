var Collider = require('../src/collider').Collider;
var Maths = Collider.Maths;

var mockObj = function(posX, posY, sizeX, sizeY, boundingBox) {
  return {
    pos: { x:posX, y:posY },
    size: { x:sizeX, y:sizeY },
    boundingBox: boundingBox
  };
};

describe('collider', function() {
  describe('maths', function() {
    describe('rectangleCorners', function() {
      it('should get corners of rect', function() {
        var obj = mockObj(5, 5, 10, 10);
        var corners = Maths.rectangleCorners(obj);
        expect(corners[0]).toEqual({ x:5, y:5 });
        expect(corners[1]).toEqual({ x:15, y:5 });
        expect(corners[2]).toEqual({ x:15, y:15 });
        expect(corners[3]).toEqual({ x:5, y:15 });
      });
    });

    describe('isLineIntersectingCircle', function() {
      it('should return false when circle and line intersect', function() {
        var obj = mockObj(5, 5, 10, 10);
        var intersecting = Maths.isLineIntersectingCircle(obj, { x:1, y:1 }, { x:20, y:20 });
        expect(intersecting).toEqual(true);
      });

      it('should return false when circle and line do not intersect', function() {
        var obj = mockObj(5, 5, 10, 10);
        var intersecting = Maths.isLineIntersectingCircle(obj, { x:1, y:1 }, { x:1, y:20 });
        expect(intersecting).toEqual(false);
      });
    });

    describe('circleAndRectangleIntersecting', function() {
      it('should return true when centres align', function() {
        var circle = mockObj(5, 5, 10, 10);
        var rectangle = mockObj(7, 7, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(true);
      });

      it('should return true when circle and rect overlap a bit', function() {
        var circle = mockObj(5, 5, 10, 10);
        var rectangle = mockObj(7, 7, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(true);
      });

      it('should return false when circle and rect do not intersect', function() {
        var circle = mockObj(5, 5, 10, 10);
        var rectangle = mockObj(16, 16, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(false);
      });
    });

    describe('isIntersecting', function() {
      it('should use rect as default bounding box', function() {
        var obj1 = mockObj(5, 5, 10, 10);
        var obj2 = mockObj(15, 15, 10, 10);
        var intersecting = Maths.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      it('should return true for two rects that are colliding', function() {
        var obj1 = mockObj(5, 5, 10, 10);
        var obj2 = mockObj(15, 15, 10, 10);
        var intersecting = Maths.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      it('should return false for two circles that are not colliding', function() {
        var obj1 = mockObj(5, 5, 10, 10, Collider.CIRCLE);
        var obj2 = mockObj(14, 14, 10, 10, Collider.CIRCLE);
        var intersecting = Maths.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(false);
      });

      it('should return true for circle+rect that are colliding (circle first)', function() {
        var obj1 = mockObj(5, 5, 10, 10, Collider.CIRCLE);
        var obj2 = mockObj(12, 12, 10, 10, Collider.RECTANGLE);
        var intersecting = Maths.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      it('should return true for circle+rect that are colliding (rect first)', function() {
        var obj1 = mockObj(5, 5, 10, 10, Collider.RECTANGLE);
        var obj2 = mockObj(12, 12, 10, 10, Collider.CIRCLE);
        var intersecting = Maths.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });
    });
  });
});
