# Coquette

A micro framework for JavaScript games.

http://github.com/maryrosecook/coquette

* By Mary Rose Cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

## Get the code

    $ git clone git://github.com/maryrosecook/coquette.git

## Example

This code appears in `demos/simple/`.

```javascript
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="../../src/coquette-min.js"></script>
    <script type="text/javascript">
      var Game = function(canvasId, width, height) {
        this.coq = new Coquette(this, canvasId, width, height, "#000");

        this.coq.entities.create(Person, { pos:{ x:68, y:40 }, color:"#0f0" }); // paramour
        this.coq.entities.create(Person, { pos:{ x:74, y:110 }, color:"#f00", // player
          update: function() {
            if (this.game.coq.inputter.state(this.game.coq.inputter.UP_ARROW)) {
              this.pos.y -= 0.4;
            }
          },
          collision: function(other) {
            other.pos.y = this.pos.y; // follow the player
          }
        });
      };

      var Person = function(game, settings) {
        this.game = game;
        for (var i in settings) {
          this[i] = settings[i];
        }
        this.size = { x:9, y:9 };
        this.draw = function() {
          game.coq.renderer.getCtx().fillStyle = settings.color;
          game.coq.renderer.getCtx().fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        };
      };

      window.addEventListener('load', function() {
        new Game("canvas", 150, 150);
      });
    </script>
  </head>
  <body><canvas id="canvas"></canvas></body>
</html>
```

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests with:

    $ cd path/to/coquette
    $ npm install --dev
    $ npm test
