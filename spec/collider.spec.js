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
        var collider = new Collider();
        var obj1 = mockObj(5, 5, 10, 10);
        var obj2 = mockObj(15, 15, 10, 10);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      describe('two rects', function() {
        describe('collisions', function() {
          it('should return true: bottom right corner over top left corner', function() {
            expect(new Collider().isIntersecting(mockObj(10, 10, 2, 4),
                                                 mockObj(12, 14, 4, 2))).toEqual(true);
          });

          it('should return true: bottom left corner over top right corner', function() {
            expect(new Collider().isIntersecting(mockObj(10, 10, 2, 4),
                                                 mockObj(6, 14, 4, 2))).toEqual(true);
          });

          it('should return true: top left corner over bottom right corner', function() {
            expect(new Collider().isIntersecting(mockObj(12, 14, 4, 2),
                                                 mockObj(10, 10, 2, 4))).toEqual(true);
          });

          it('should return true: top right corner over bottom left corner', function() {
            expect(new Collider().isIntersecting(mockObj(6, 14, 4, 2),
                                                 mockObj(10, 10, 2, 4))).toEqual(true);
          });
        });

        describe('non-collisions', function() {
          it('should return true: bottom right corner over top left corner', function() {
            expect(new Collider().isIntersecting(mockObj(10, 10, 2, 4),
                                                 mockObj(13, 14, 4, 2))).toEqual(false);
          });

          it('should return true: bottom left corner over top right corner', function() {
            expect(new Collider().isIntersecting(mockObj(10, 10, 2, 4),
                                                 mockObj(5, 14, 4, 2))).toEqual(false);
          });

          it('should return true: top left corner over bottom right corner', function() {
            expect(new Collider().isIntersecting(mockObj(13, 14, 4, 2),
                                                 mockObj(10, 10, 2, 4))).toEqual(false);
          });

          it('should return true: top right corner over bottom left corner', function() {
            expect(new Collider().isIntersecting(mockObj(5, 14, 4, 2),
                                                 mockObj(10, 10, 2, 4))).toEqual(false);
          });
        });
      });

      it('should return false for two circles that are not colliding', function() {
        var collider = new Collider();
        var obj1 = mockObj(5, 5, 10, 10, collider.CIRCLE);
        var obj2 = mockObj(14, 14, 10, 10, collider.CIRCLE);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(false);
      });

      it('should return true for circ+rect that are colliding', function() {
        var collider = new Collider();
        var obj1 = mockObj(5, 5, 10, 10, collider.CIRCLE);
        var obj2 = mockObj(14, 14, 10, 10, collider.RECTANGLE);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(false);
      });

      it('should return true for point+rect that are colliding', function() {
        var collider = new Collider();
        var obj1 = mockObj(5, 5, 1, 1, collider.POINT);
        var obj2 = mockObj(0, 0, 10, 10, collider.RECTANGLE);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      it('should return true for point+circ that are colliding', function() {
        var collider = new Collider();
        var obj1 = mockObj(5, 5, 1, 1, collider.POINT);
        var obj2 = mockObj(0, 0, 10, 10, collider.CIRCLE);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      it('should throw when either obj has invalid bounding box', function() {
        var collider = new Collider();

        var obj1 = mockObj(5, 5, 1, 1, "la");
        var obj2 = mockObj(0, 0, 10, 10, collider.CIRCLE);
        expect(function() {
          collider.isIntersecting(obj1, obj2);
        }).toThrow();

        var obj1 = mockObj(5, 5, 1, 1, Collider.CIRCLE);
        var obj2 = mockObj(0, 0, 10, 10, "la");
        expect(function() {
          collider.isIntersecting(obj1, obj2);
        }).toThrow();
      });

      describe('object ordering', function() {
        it('should only return true when circle+rect in right order to collide', function() {
          var collider = new Collider();

          var obj1 = mockObj(33, 33, 10, 10, collider.CIRCLE);
          var obj2 = mockObj(5, 5, 30, 30, collider.RECTANGLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(true);

          // same dimensions, swap shape type and get no collision
          var obj1 = mockObj(33, 33, 10, 10, collider.RECTANGLE);
          var obj2 = mockObj(5, 5, 30, 30, collider.CIRCLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(false);
        });

        it('should only return true when point+rect in right order to collide', function() {
          var collider = new Collider();

          var obj1 = mockObj(5, 5, 1, 1, collider.POINT);
          var obj2 = mockObj(0, 0, 10, 10, collider.RECTANGLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(true);

          // same dimensions, swap shape type and get no collision
          var obj1 = mockObj(5, 5, 1, 1, collider.RECTANGLE);
          var obj2 = mockObj(0, 0, 10, 10, collider.POINT);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(false);
        });

        it('should only return true when point+circ in right order to collide', function() {
          var collider = new Collider();

          var obj1 = mockObj(5, 5, 1, 1, collider.POINT);
          var obj2 = mockObj(0, 0, 10, 10, collider.CIRCLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(true);

          // same dimensions, swap shape type and get no collision
          var obj1 = mockObj(5, 5, 1, 1, collider.CIRCLE);
          var obj2 = mockObj(0, 0, 10, 10, collider.POINT);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(false);
        });
      });
    });
  });

  describe('regressions', function() {
    it('should not re-report coll as result of entity reorder', function() {
      // In progress collisions recorded inside collider.  When checking to see
      // if collision already recorded, assumed two entities would be in same order in
      // record.  This assumption valid if entities always compared in same order.
      // But, this was occasionally not the case after zindex sort following entity
      // creation.

      var MockCoquette = function() {
        this.entities = new Entities(this);
        this.runner = new Runner(this);
        this.collider = new Collider(this);
        this.renderer = new Renderer(this, {}, {
          style: {},
          getContext: function() { }
        });
      };

      var Entity = function(__, settings) {
        for (var i in settings) {
          this[i] = settings[i];
        }
      };

      // prove that sorting on entities with zindexes of zeroes reorders them
      // (this was how the entities got reordered)

      var c = new MockCoquette();
      c.entities.create(Entity, { zindex: 0, id: 0 });
      c.entities.create(Entity, { zindex: 0, id: 1 });
      c.runner.update();
      expect(c.entities.all()[0].id).toEqual(0);
      expect(c.entities.all()[1].id).toEqual(1);

      c.entities.all().sort(function(a, b) {
        return (a.zindex || 0) < (b.zindex || 0) ? -1 : 1;
      });
      expect(c.entities.all()[0].id).toEqual(1);
      expect(c.entities.all()[1].id).toEqual(0);

      // prove that Entities.create no longer sorts on zindex

      c = new MockCoquette();
      c.entities.create(Entity, { zindex: 1 });
      c.entities.create(Entity, { zindex: 0 });
      c.runner.update();
      expect(c.entities.all()[0].zindex).toEqual(1);
      expect(c.entities.all()[1].zindex).toEqual(0);

      // prove that reordering entities produces the bug

      c = new MockCoquette();
      var initial = 0;
      c.entities.create(Entity, {
        uncollision: function() {}, // switch off repeated collision reporting
        collision: function(__, type) {
          if (type === c.collider.INITIAL) {
            initial++;
          }
        }
      });
      c.entities.create(Entity);

      c.runner.update();

      var restoreIsIntersecting = mock(c.collider, 'isIntersecting', function() {
        return true;
      });

      c.collider.update();
      expect(initial).toEqual(1);
      c.collider.update();
      expect(initial).toEqual(1); // collision not re-reported

      var temp = c.entities._entities[0];
      c.entities._entities[0] = c.entities._entities[1];
      c.entities._entities[1] = temp; // reorder entities
      c.collider.update();
      expect(initial).toEqual(2); // boom
      restoreIsIntersecting();
    });
  });
});
