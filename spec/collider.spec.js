var Collider = require('../src/collider').Collider;
var Renderer = require('../src/renderer').Renderer;
var Entities = require('../src/entities').Entities;
var Maths = Collider.Maths;

var mockObj = function(centerX, centerY, sizeX, sizeY, boundingBox, angle) {
  return {
    center: { x:centerX, y:centerY },
    size: { x:sizeX, y:sizeY },
    boundingBox: boundingBox,
    angle: angle === undefined ? 0 : angle
  };
};

var mock = function(thingToMockHost, thingToMockAttribute, mock) {
  var originalThingToMock = thingToMockHost[thingToMockAttribute];
  thingToMockHost[thingToMockAttribute] = mock;
  return function() {
    thingToMockHost[thingToMockAttribute] = originalThingToMock;
  };
};

describe('collider', function() {
  describe('main collider obj', function() {
    var MockCoquette = function() {
      this.entities = new Entities(this);
      this.collider = new Collider(this);
    };

    var Thing = function(__, settings) {
      for (var i in settings) {
        this[i] = settings[i];
      }
    };

    describe('changes to entity list during collision detection', function() {
      describe('create', function() {
        it('should not add coll pair for new entity with itself', function() {
          var c = new MockCoquette();
          var unmock = mock(c.collider, "isColliding", function(a, b) {
            return true;
          });

          var haveCreatedEntity = false;
          var others = [];
          c.entities.create(Thing, { id: 0, collision: function() {
            if (!haveCreatedEntity) {
              haveCreatedEntity = true;
              c.entities.create(Thing, { id: 2, collision: function(other) {
                others.push(other);
              }});
            }
          }});
          c.entities.create(Thing, { id: 1 });

          c.collider.update();
          expect(others[0].id).toEqual(0);
          expect(others[1].id).toEqual(1);
          expect(others.length).toEqual(2);
          unmock();
        });

        it('should do collisions for new entity during current round of coll detection', function() {
          var c = new MockCoquette();
          var unmock = mock(c.collider, "isColliding", function(a, b) {
            return true;
          });

          var haveCreatedEntity = false;
          var createdEntityCollisions = 0;
          c.entities.create(Thing, { id: 0, collision: function() {
            if (!haveCreatedEntity) {
              haveCreatedEntity = true;
              c.entities.create(Thing, { id: 2, collision: function(other) {
                createdEntityCollisions++;
              }});
            }
          }});
          c.entities.create(Thing, { id: 1 });

          c.collider.update();
          expect(createdEntityCollisions).toEqual(2);
          unmock();
        });
      });

      describe('destroy', function() {
        it('should not do more coll tests for destroyed entity', function() {
          var c = new MockCoquette();
          var unmock = mock(c.collider, "isColliding", function(a, b) {
            return true;
          });

          var collisionCounter = 0;
          var collisionCounterFn = function(other) {
            if (other.id === 0) {
              collisionCounter++;
            }
          };

          // 0 should collide with 1, 2 and 3
          c.entities.create(Thing, { id: 0 });
          c.entities.create(Thing, { id: 1, collision: collisionCounterFn });
          c.entities.create(Thing, { id: 2, collision: collisionCounterFn });
          c.entities.create(Thing, { id: 3, collision: collisionCounterFn });
          c.collider.update();
          expect(collisionCounter).toEqual(3);

          // should only count coll for 0 and 1, not 2 and 3:
          collisionCounter = 0;
          c.entities._entities = [];
          c.entities.create(Thing, { id: 0, collision: function() { c.entities.destroy(this); } });
          c.entities.create(Thing, { id: 1, collision: collisionCounterFn });
          c.entities.create(Thing, { id: 2, collision: collisionCounterFn });
          c.entities.create(Thing, { id: 3, collision: collisionCounterFn });
          c.collider.update();
          expect(collisionCounter).toEqual(1);

          unmock();
        });

        it('should still do all other entity collisions if entity removed for which all coll pairs already done', function() {
          var c = new MockCoquette();
          var unmock = mock(c.collider, "isColliding", function(a, b) {
            return true;
          });

          var rmEnt = c.entities.create(Thing, { id: 0 });

          var collisions = 0;
          for (var i = 1; i < 4; i++) {
            c.entities.create(Thing, { id: i, collision: function() { collisions++; }});
          }

          c.entities.create(Thing, { id: i, collision: function() { c.entities.destroy(rmEnt); }});
          c.collider.update();
          expect(collisions).toEqual(12);
          unmock();
        });

        it('should still do all other entity collisions if entity removed for which only some coll pairs done', function() {
          var c = new MockCoquette();
          var unmock = mock(c.collider, "isColliding", function(a, b) {
            return true;
          });

          var rmEnt = c.entities.create(Thing, { id: 0, collision: function() { c.entities.destroy(this); } });

          var collisions = 0;
          for (var i = 1; i < 4; i++) {
            c.entities.create(Thing, { id: i, collision: function() { collisions++; }});
          }

          c.collider.update();
          expect(collisions).toEqual(7);
          unmock();
        });
      });
    });

    describe('update()', function() {
      it('should test all entities against all other entities once', function() {
        var c = new MockCoquette();
        var comparisons = [];
        var unmock = mock(c.collider, "isColliding", function(a, b) {
          comparisons.push([a.id, b.id]);
        });

        c.entities.create(Thing, { id: 0 });
        c.entities.create(Thing, { id: 1 });
        c.entities.create(Thing, { id: 2 });
        c.entities.create(Thing, { id: 3 });
        c.collider.update();
        expect(comparisons.length).toEqual(6);
        expect(comparisons[0][0] === 0 && comparisons[0][1] === 1).toEqual(true);
        expect(comparisons[1][0] === 0 && comparisons[1][1] === 2).toEqual(true);
        expect(comparisons[2][0] === 0 && comparisons[2][1] === 3).toEqual(true);
        expect(comparisons[3][0] === 1 && comparisons[3][1] === 2).toEqual(true);
        expect(comparisons[4][0] === 1 && comparisons[4][1] === 3).toEqual(true);
        expect(comparisons[5][0] === 2 && comparisons[5][1] === 3).toEqual(true);
        unmock();
      });

      it('should do no comparisons when only one entity', function() {
        var c = new MockCoquette();
        var unmock = mock(c.collider, "isColliding", function(a, b) {
          throw "arg";
        });

        c.entities.create(Thing, { id: 0 });
        c.collider.update();
        unmock();
      });
    });

    describe('collision()', function() {
      it('should keep on banging out collision callbacks', function() {
        var c = new MockCoquette();

        var unmock = mock(c.collider, "isColliding", function() { return true });
        var collisions = 0;
        c.entities.create(Thing, {
          collision: function() {
            collisions++;
          }
        });
        c.entities.create(Thing);
        c.collider.update();
        c.collider.update();
        c.collider.update();
        expect(collisions).toEqual(3);
        unmock();
      });
    });
  });

  describe('maths', function() {
    describe('rectangleCorners', function() {
      it('should get corners of rect', function() {
        var obj = mockObj(10, 10, 10, 10);
        var corners = Maths.rectangleCorners(obj);
        expect(corners[0]).toEqual({ x:5, y:5 });
        expect(corners[1]).toEqual({ x:15, y:5 });
        expect(corners[2]).toEqual({ x:15, y:15 });
        expect(corners[3]).toEqual({ x:5, y:15 });
      });
    });

    describe('circleAndRectangleIntersecting', function() {
      it('should return true when centres align', function() {
        var circle = mockObj(12, 12, 10, 10);
        var rectangle = mockObj(12, 12, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(true);
      });

      it('should return true when circle and rect overlap a bit', function() {
        var circle = mockObj(10, 10, 10, 10);
        var rectangle = mockObj(12, 12, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(true);
      });

      it('should return false when circle and rect do not intersect', function() {
        var circle = mockObj(10, 10, 10, 10);
        var rectangle = mockObj(21, 21, 10, 10);
        var intersecting = Maths.circleAndRectangleIntersecting(circle, rectangle);
        expect(intersecting).toEqual(false);
      });
    });

    describe('isColliding', function() {
      describe('objects not set up for collisions', function() {
        var correctObj = mockObj(5, 5, 10, 10);
        var c = new Collider();
        it('should return true for two objects with center and size', function() {
          expect(c.isColliding(correctObj, mockObj(5, 5, 10, 10))).toEqual(true);
        });

        it('should return false when center missing', function() {
          expect(c.isColliding(correctObj, { size: { x:1, y: 1 }})).toEqual(false);
          expect(c.isColliding({ size: { x:1, y: 1 }}, correctObj)).toEqual(false);
        });

        it('should return false when size missing', function() {
          expect(c.isColliding(correctObj, { center: { x:1, y: 1 }})).toEqual(false);
          expect(c.isColliding({ center: { x:1, y: 1 }}, correctObj)).toEqual(false);
        });
      });
    });

    describe('isIntersecting', function() {
      it('should use rect as default bounding box', function() {
        var collider = new Collider();
        var obj1 = mockObj(10, 10, 10, 10);
        var obj2 = mockObj(20, 20, 10, 10);
        var intersecting = collider.isIntersecting(obj1, obj2);
        expect(intersecting).toEqual(true);
      });

      describe('two rects', function() {
        describe('collisions', function() {
          it('should return true: bottom right corner over top left corner', function() {
            expect(new Collider().isIntersecting(mockObj(11, 12, 2, 4),
                                                 mockObj(14, 15, 4, 2))).toEqual(true);
          });

          it('should return true: bottom left corner over top right corner', function() {
            expect(new Collider().isIntersecting(mockObj(11, 12, 2, 4),
                                                 mockObj(8, 15, 4, 2))).toEqual(true);
          });

          it('should return true: top left corner over bottom right corner', function() {
            expect(new Collider().isIntersecting(mockObj(14, 15, 4, 2),
                                                 mockObj(11, 12, 2, 4))).toEqual(true);
          });

          it('should return true: top right corner over bottom left corner', function() {
            expect(new Collider().isIntersecting(mockObj(8, 15, 4, 2),
                                                 mockObj(11, 12, 2, 4))).toEqual(true);
          });

          it('should return true: rotated top right just touching rotated top left', function() {
            expect(new Collider().isIntersecting(mockObj(207, 222, 70, 43, Collider.prototype.RECTANGLE, 325),
                                                 mockObj(280, 235, 70, 43, Collider.prototype.RECTANGLE, -484))).toEqual(true);
          });

          it('should return true: rotated bottom right just touching rotated top left', function() {
            expect(new Collider().isIntersecting(mockObj(238, 205, 70, 43, Collider.prototype.RECTANGLE, 280),
                                                 mockObj(207, 133, 70, 43, Collider.prototype.RECTANGLE, 93))).toEqual(true);
          });

          it('should return true: rotated top right just touching rotated bottom left', function() {
            expect(new Collider().isIntersecting(mockObj(349, 171, 70, 43, Collider.prototype.RECTANGLE, 113),
                                                 mockObj(409, 123, 70, 43, Collider.prototype.RECTANGLE, 649))).toEqual(true);
          });
        });

        describe('non-collisions', function() {
          it('should return true: bottom right corner over top left corner', function() {
            expect(new Collider().isIntersecting(mockObj(11, 12, 2, 4),
                                                 mockObj(15, 15, 4, 2))).toEqual(false);
          });

          it('should return true: bottom left corner over top right corner', function() {
            expect(new Collider().isIntersecting(mockObj(11, 12, 2, 4),
                                                 mockObj(7, 15, 4, 2))).toEqual(false);
          });

          it('should return true: top left corner over bottom right corner', function() {
            expect(new Collider().isIntersecting(mockObj(13, 14, 4, 2),
                                                 mockObj(10, 10, 2, 4))).toEqual(false);
          });

          it('should return true: top right corner over bottom left corner', function() {
            expect(new Collider().isIntersecting(mockObj(7, 15, 4, 2),
                                                 mockObj(11, 12, 2, 4))).toEqual(false);
          });

          it('should return false: rotated top right just missing rotated top left', function() {
            expect(new Collider().isIntersecting(mockObj(199, 223, 70, 43, Collider.prototype.RECTANGLE, 325),
                                                 mockObj(283, 237, 70, 43, Collider.prototype.RECTANGLE, -484))).toEqual(false);
          });

          it('should return false: rotated bottom right just missing rotated top left', function() {
            expect(new Collider().isIntersecting(mockObj(242, 213, 70, 43, Collider.prototype.RECTANGLE, 280),
                                                 mockObj(207, 133, 70, 43, Collider.prototype.RECTANGLE, 93))).toEqual(false);
          });

          it('should return true: rotated top right just missing rotated bottom left', function() {
            expect(new Collider().isIntersecting(mockObj(340, 177, 70, 43, Collider.prototype.RECTANGLE, 113),
                                                 mockObj(409, 123, 70, 43, Collider.prototype.RECTANGLE, 649))).toEqual(false);
          });
        });
      });

      describe('circle and rectangle', function() {
        describe('collisions', function() {
          it('should return true: circles side by side just overlapping', function() {
            expect(new Collider().isIntersecting(mockObj(332, 180, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(282, 182, 55, 55, Collider.prototype.CIRCLE))).toEqual(true);
          });

          it('should return true: circles one on top of the other just overlapping', function() {
            expect(new Collider().isIntersecting(mockObj(291, 192, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(289, 241, 55, 55, Collider.prototype.CIRCLE))).toEqual(true);
          });
        });

        describe('non-collisions', function() {
          it('should return false: circles side by side just missing', function() {
            expect(new Collider().isIntersecting(mockObj(345, 180, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(282, 182, 55, 55, Collider.prototype.CIRCLE))).toEqual(false);
          });

          it('should return false: circles one on top of the other just missing', function() {
            expect(new Collider().isIntersecting(mockObj(291, 186, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(289, 249, 55, 55, Collider.prototype.CIRCLE))).toEqual(false);
          });
        });
      });

      describe('circle and rectangle', function() {
        describe('collisions', function() {
          it('should return true for circ+rect that are colliding', function() {
            var collider = new Collider();
            var obj1 = mockObj(10, 10, 10, 10, collider.CIRCLE);
            var obj2 = mockObj(14, 14, 10, 10, collider.RECTANGLE);
            expect(collider.isIntersecting(obj1, obj2)).toEqual(true);
          });

          it('should return true: rotated top right just touching circle', function() {
            expect(new Collider().isIntersecting(mockObj(208, 181, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(true);
          });

          it('should return true: rotated bottom right just touching circle', function() {
            expect(new Collider().isIntersecting(mockObj(163, 277, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(true);
          });

          it('should return true: rotated top left side just touching circle', function() {
            expect(new Collider().isIntersecting(mockObj(112, 193, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(true);
          });
        });

        describe('non-collisions', function() {
          it('should return false for circ+rect that are not colliding', function() {
            var collider = new Collider();
            var obj1 = mockObj(10, 10, 10, 10, collider.CIRCLE);
            var obj2 = mockObj(19, 19, 10, 10, collider.RECTANGLE);
            var intersecting = collider.isIntersecting(obj1, obj2);
            expect(intersecting).toEqual(false);
          });

          it('should return false: rotated top right just missing circle', function() {
            expect(new Collider().isIntersecting(mockObj(223, 180, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(false);
          });

          it('should return false: rotated bottom right just missing circle', function() {
            expect(new Collider().isIntersecting(mockObj(166, 288, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(false);
          });

          it('should return false: rotated top left side just missing circle', function() {
            expect(new Collider().isIntersecting(mockObj(105, 186, 55, 55, Collider.prototype.CIRCLE),
                                                 mockObj(153, 216, 70, 43, Collider.prototype.RECTANGLE, 123))).toEqual(false);
          });
        });
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

          var obj1 = mockObj(38, 38, 10, 10, collider.CIRCLE);
          var obj2 = mockObj(20, 20, 30, 30, collider.RECTANGLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(true);

          // same dimensions, swap shape type and get no collision
          var obj1 = mockObj(38, 38, 10, 10, collider.RECTANGLE);
          var obj2 = mockObj(20, 20, 30, 30, collider.CIRCLE);
          expect(collider.isIntersecting(obj1, obj2)).toEqual(false);
        });
      });
    });
  });
});
