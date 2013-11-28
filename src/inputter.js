;(function(exports) {
  var Inputter = function(coquette, canvas, autoFocus) {
    this.coquette = coquette;
    this._keyDownState = {};
    this._keyPressedState = {};
    var self = this;

    var receiver = getInputReceiverElement(window, canvas, autoFocus);
    connectInputReceiverToInput(receiver, window, autoFocus);

    // set up key listeners

    inputReceiverElement.addEventListener('keydown', function(e) {
      self._keyDownState[e.keyCode] = true;
      if (self._keyPressedState[e.keyCode] === undefined) { // start of new keypress
        self._keyPressedState[e.keyCode] = true; // register keypress in progress
      }
    }, false);

    inputReceiverElement.addEventListener('keyup', function(e) {
      self._keyDownState[e.keyCode] = false;
      if (self._keyPressedState[e.keyCode] === false) { // prev keypress over
        self._keyPressedState[e.keyCode] = undefined; // prep for keydown to start next press
      }
    }, false);
  };

  Inputter.prototype = {
    update: function() {
      for (var i in this._keyPressedState) {
        if (this._keyPressedState[i] === true) { // tick passed and press event in progress
          this._keyPressedState[i] = false; // end key press
        }
      }
    // Returns true if passed button currently down
    isDown: function(button) {
      return this._buttonListener.isDown(button);
    },

    // Returns true if passed button just gone down. true once per keypress.
    isPressed: function(button) {
      return this._buttonListener.isPressed(button);
    },

    },

    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    INSERT: 45,
    DELETE: 46,
    ZERO: 48,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    FIVE: 53,
    SIX: 54,
    SEVEN: 55,
    EIGHT: 56,
    NINE: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMI_COLON: 186,
    EQUALS: 187,
    COMMA: 188,
    DASH: 189,
    PERIOD: 190,
    FORWARD_SLASH: 191,
    GRAVE_ACCENT: 192,
    OPEN_SQUARE_BRACKET: 219,
    BACK_SLASH: 220,
    CLOSE_SQUARE_BRACKET: 221,
    SINGLE_QUOTE: 222
  };

  var getInputReceiverElement = function(window, canvas, autoFocus) {
    var receiver = window;
    if (autoFocus === false) {
      receiver = canvas;
    }

    return receiver;
  };

  var connectInputReceiverToInput = function(receiver, window, autoFocus) {
    if (autoFocus === false) {
      receiver.contentEditable = true; // lets canvas get focus and get key events
    } else {
      var suppressedKeys = [
        Inputter.prototype.SPACE,
        Inputter.prototype.LEFT_ARROW,
        Inputter.prototype.UP_ARROW,
        Inputter.prototype.RIGHT_ARROW,
        Inputter.prototype.DOWN_ARROW
      ];

      // suppress scrolling
      window.addEventListener("keydown", function(e) {
        for (var i = 0; i < suppressedKeys.length; i++) {
          if(suppressedKeys[i] === e.keyCode) {
            e.preventDefault();
            return;
          }
        }
      }, false);
    }
  };
  exports.Inputter = Inputter;
})(typeof exports === 'undefined' ? this.Coquette : exports);
