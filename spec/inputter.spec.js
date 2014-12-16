var Inputter = require('../src/inputter').Inputter;

var InputReceiver = function() {
  var callbacks = {};
  this.fire = function(eventName, data) {
    if (callbacks[eventName] !== undefined) {
      for (var i = 0; i < callbacks[eventName].length; i++) {
        callbacks[eventName][i](data);
      }
    }
  };

  this.addEventListener = function(eventName, fn) {
    callbacks[eventName] = callbacks[eventName] || [];
    callbacks[eventName].push(fn);
  };

  this.getBoundingClientRect = function() {
    return {
      left: 0,
      top: 0
    }
  };

  // mock scroll state, body borders for element position tests
  this.nodeType = 9;
  this.ownerDocument = {
    defaultView: {},
    body: { scrollLeft: 0, scrollTop: 0, clientLeft: 0, clientTop: 0 }
  };
};

// very simple - just has basic stuff
var mockMouseMoveEvent = function() {
  return { pageX: 10, pageY: 10 };
};

describe('inputter', function() {
  describe('input source', function() {
    describe('autoFocus and keyboard events', function() {
      describe('window', function() {
        beforeEach(function() {
          window = new InputReceiver();
        });

        afterEach(function() {
          window = undefined; // undo global effect as best as possible
        });

        it('should use window if autoFocus set to false', function() {
          var canvas = new InputReceiver(); // swallow incidental binds
          var inp = new Inputter(null, canvas, true);
          window.fire("keydown", { keyCode: 51 });
          expect(inp.isDown(51)).toEqual(true);
        });

        it('should ignore presses on suppressed keys', function() {
          var canvas = new InputReceiver(); // swallow incidental binds
          var inp = new Inputter(null, canvas, true);

          var run = false;
          expect(run).toEqual(false);
          window.fire("keydown", {
            keyCode: 32, // space (suppressed key)
            preventDefault: function() {
              run = true;
            }
          });

          expect(run).toEqual(true);
        })
      });

      describe('canvas', function() {
        it('should use canvas if autoFocus set to true', function() {
          var receiver = new InputReceiver();
          var inp = new Inputter(null, receiver, false);
          receiver.fire("keydown", { keyCode: 51 });
          expect(inp.isDown(51)).toEqual(true);
        });

        it('should set contentEditable to true', function() {
          var canvas = new InputReceiver();
          var inp = new Inputter(null, canvas, false);
          expect(canvas.contentEditable).toEqual(true);
        })
      });
    });

    describe('mouse button events', function() {
      it('should not respond to mouse button events sent to window', function() {
        var canvas = new InputReceiver();
        var inp = new Inputter(null, canvas, false);
        canvas.fire("mousedown", { which: 1 });
        expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(true);

        window = new InputReceiver();
        inp = new Inputter(null, canvas, false);
        window.fire("mousedown", { which: 1 });
        expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(false);
      });
    });

    describe('mouse move event', function() {
      it('should not respond to mouse move events sent to window', function() {
        var canvas = new InputReceiver();
        var inp = new Inputter(null, canvas, false);
        var called = false;
        inp.bindMouseMove(function(e) { called = true; });
        canvas.fire("mousemove", mockMouseMoveEvent());
        expect(called).toEqual(true);

        window = new InputReceiver();
        inp = new Inputter(null, canvas, false);
        inp.bindMouseMove(function(e) { throw "Should not happen"; });
        window.fire("mousemove", mockMouseMoveEvent());
      });
    });
  });

  describe('keyboard input', function() {
    var canvas, inp;
    beforeEach(function() {
      canvas = new InputReceiver();
      inp = new Inputter(null, canvas, false);
    });

    describe('isDown()', function() {
      it('should say down key is down', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isDown(51)).toEqual(true);
      });

      it('should say never down key is not down', function() {
        expect(inp.isDown(51)).toEqual(false);
      });

      it('should say key that has gone down then up not down', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isDown(51)).toEqual(true);
        canvas.fire("keyup", { keyCode: 51 });
        expect(inp.isDown(51)).toEqual(false);
      });

      it('should say key that is not down is not down when other key is down', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isDown(52)).toEqual(false);
      });
    });

    describe('isPressed()', function() {
      it('should say pressed key is pressed', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
      });

      it('should say pressed key is still pressed after keyup if no update', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
        canvas.fire("keyup", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
      });

      it('should say pressed key is not pressed after keyup if update', function() {
        canvas.fire("keydown", { keyCode: 51 });
        canvas.fire("keyup", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
        inp.update();
        expect(inp.isPressed(51)).toEqual(false);
      });

      it('should say pressed key is not pressed in next tick', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
        inp.update();
        expect(inp.isPressed(51)).toEqual(false);
      });

      it('should say key is not pressed if get keyup with no preceding keydown', function() {
        canvas.fire("keyup", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(false);
      });

      it('should say key not pressed is not pressed if other key is pressed', function() {
        canvas.fire("keydown", { keyCode: 51 });
        expect(inp.isPressed(51)).toEqual(true);
        expect(inp.isPressed(52)).toEqual(false);
      });
    });
  });

  describe('mouse', function() {
    describe('buttons', function() {
      var canvas, inp;
      beforeEach(function() {
        canvas = new InputReceiver();
        inp = new Inputter(null, canvas, false);
      });

      describe('isDown()', function() {
        it('should say all mouse buttons not down when no events sent', function() {
          expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(false);
          expect(inp.isDown(inp.RIGHT_MOUSE)).toEqual(false);
        });

        it('should say down mouse button is down', function() {
          canvas.fire("mousedown", { which: 1 });
          expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(true);
        });

        it('should say button that has gone down then up not down', function() {
          canvas.fire("mousedown", { which: 1 });
          expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(true);
          canvas.fire("mouseup", { which: 1 });
          expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(false);
        });

        it('should say button that is not down is not down when other button is down', function() {
          canvas.fire("mousedown", { which: 3 });
          expect(inp.isDown(inp.RIGHT_MOUSE)).toEqual(true);
          expect(inp.isDown(inp.LEFT_MOUSE)).toEqual(false);
        });
      });

      describe('isPressed()', function() {
        it('should say all mouse buttons not pressed when no events sent', function() {
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(false);
          expect(inp.isPressed(inp.RIGHT_MOUSE)).toEqual(false);
        });

        it('should say pressed button is pressed', function() {
          canvas.fire("mousedown", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(true);
        });

        it('should say pressed button is still pressed after mouseup if no update', function() {
          canvas.fire("mousedown", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(true);
          canvas.fire("mouseup", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(true);
        });

        it('should say pressed button is not pressed after mouseup if update', function() {
          canvas.fire("mousedown", { which: 1 });
          canvas.fire("mouseup", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(true);
          inp.update();
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(false);
        });

        it('should say pressed button is not pressed in next tick', function() {
          canvas.fire("mousedown", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(true);
          inp.update();
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(false);
        });

        it('should say key is not pressed if get keyup with no preceding keydown', function() {
          canvas.fire("mouseup", { which: 1 });
          expect(inp.isPressed(inp.LEFT_MOUSE)).toEqual(false);
        });
      });

      describe('_getMouseButton()', function() {
        it('should throw if does not get event with .which or .button', function() {
          expect(function() {
            inp._buttonListener._getMouseButton();
          }).toThrow("Cannot read property 'which' of undefined");

          expect(function() {
            inp._buttonListener._getMouseButton({});
          }).toThrow("Cannot judge button pressed on passed mouse button event");

          inp._buttonListener._getMouseButton({ which: 1 });
          inp._buttonListener._getMouseButton({ button: 1 });
        });

        it('should throw for all event which and button values not covered', function() {
          [{ which: 0 }, { which: 2 }, { which:4 }, { button: 3 }].forEach(function(e) {
            expect(function() {
              inp._buttonListener._getMouseButton(e);
            }).toThrow("Cannot judge button pressed on passed mouse button event");
          });
        });

        it('should return left button for button:0', function() {
          expect(inp._buttonListener._getMouseButton({ button: 0 })).toEqual(inp.LEFT_MOUSE);
        });

        it('should return left button for which:1', function() {
          expect(inp._buttonListener._getMouseButton({ which: 1 })).toEqual(inp.LEFT_MOUSE);
        });

        it('should return left button for button:1', function() {
          expect(inp._buttonListener._getMouseButton({ button: 1 })).toEqual(inp.LEFT_MOUSE);
        });

        it('should return right button for which:3', function() {
          expect(inp._buttonListener._getMouseButton({ which: 3 })).toEqual(inp.RIGHT_MOUSE);
        });

        it('should return right button for button:2', function() {
          expect(inp._buttonListener._getMouseButton({ button: 2 })).toEqual(inp.RIGHT_MOUSE);
        });
      });
    });

    describe('moving', function() {
      var canvas, inp;
      beforeEach(function() {
        canvas = new InputReceiver();
        inp = new Inputter(null, canvas, false);
      });

      describe('bindMouseMove()', function() {
        it('should call fn bound to mouse move when mouse moves', function(done) {
          inp.bindMouseMove(function() { done(); });
          canvas.fire("mousemove", mockMouseMoveEvent());
        });

        it('should call all bound fns when mouse moves', function() {
          var firstCalled = false;
          var secondCalled = false;
          inp.bindMouseMove(function() { firstCalled = true; });
          inp.bindMouseMove(function() { secondCalled = true; });
          canvas.fire("mousemove", mockMouseMoveEvent());
          expect(firstCalled).toEqual(true);
          expect(secondCalled).toEqual(true);
        });

        it('should return mouse positions relative to canvas', function(done) {
          canvas.getBoundingClientRect = function() {
            return {
              left : 20,
              top : 15
            }
          }

          // remake to recalc elementPosition: will be fine in real code
          // cause canvas will be positioned
          inp = new Inputter(null, canvas, false);

          inp.bindMouseMove(function(e) {
            expect(e).toEqual({ x: 30, y: 40 });
            done();
          });
          canvas.fire("mousemove", { pageX: 50, pageY: 55 });
        });
      });

      describe('unbindMouseMove()', function() {
        it('should unbind passed fn', function() {
          var calls = 0;
          var boundFn = function() {
            calls++;
          };

          inp.bindMouseMove(boundFn);
          canvas.fire("mousemove", mockMouseMoveEvent());
          inp.unbindMouseMove(boundFn);
          canvas.fire("mousemove", mockMouseMoveEvent());
          expect(calls).toEqual(1);
        });

        it('should unbind passed fn', function(done) {
          var fnThatWillGetUnbound = function() {};
          inp.bindMouseMove(fnThatWillGetUnbound);
          inp.bindMouseMove(function() { done(); });
          inp.unbindMouseMove(fnThatWillGetUnbound);
          canvas.fire("mousemove", mockMouseMoveEvent());
        });

        it('should throw if given fn that was not bound', function() {
          expect(function() {
            inp.unbindMouseMove(function() { });
          }).toThrow("Function to unbind from mouse moves was never bound");
        });
      });

      describe('_getAbsoluteMousePosition()', function() {
        it('should return pageX and pageY when they are on event', function() {
          expect(inp._mouseMoveListener._getAbsoluteMousePosition({ pageX: 10, pageY: 20 }))
            .toEqual({ x: 10, y: 20 });
        });

        it('should return clientX and clientY when they are on event', function() {
          expect(inp._mouseMoveListener._getAbsoluteMousePosition({ clientX: 10, clientY: 20 }))
            .toEqual({ x: 10, y: 20 });
        });
      });
    });
  });
});
