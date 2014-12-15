# Coquette

A micro framework for JavaScript games.

Handles collision detection, the game update loop, canvas rendering, and keyboard and mouse input.

http://coquette.maryrosecook.com

## Get the code

* Minified: https://github.com/maryrosecook/coquette/coquette-min.js
* Single file: https://github.com/maryrosecook/coquette/coquette.js
* GitHub: https://github.com/maryrosecook/coquette
* `$ npm install coquette`

## Example

A game where you, the valiant player, must find a person of indeterminate gender in distress so you can take them away from all this.  The code below appears in `/demos/simple/`.  Open `/demos/simple/index.html` to play.

The HTML below defines a canvas element and loads in Coquette and the game code.

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="../../coquette.js"></script>
    <script type="text/javascript" src="game.js"></script>
  </head>
  <body><canvas id="canvas"></canvas></body>
</html>
```

The game code:

```javascript
var Game = function() {
  this.c = new Coquette(this, "canvas", 500, 150, "#000");

  // paramour
  this.c.entities.create(Person, { center: { x:250, y:40 }, color:"#099" });

  // player
  this.c.entities.create(Person, { center: { x:256, y:110 }, color:"#f07",
    update: function() {
      if (this.c.inputter.isDown(this.c.inputter.UP_ARROW)) {
        this.center.y -= 0.4;
      }
    },

    collision: function(other) {
      other.center.y = this.center.y; // follow the player
    }
  });
};

var Person = function(game, settings) {
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }

  this.size = { x:9, y:9 };
  this.draw = function(ctx) {
    ctx.fillStyle = settings.color;
    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  };
};

window.addEventListener('load', function() {
  new Game();
});
```

## Demos

Five demos are included in this repository:

* `/demos/spinning-shapes` - an example of collisions between rotated entities.
* `/demos/racecar` - a 2D racing game.
* `/demos/box2d-physics` - a game that uses the Box2D physics engine.
* `/demos/leftrightspace` - a complete game.
* `/demos/simple` - the example at the top of this readme.

## Reference

### Instantiate Coquette

Pass in:

* Your main game object.
* The ID of the canvas element, e.g. `"canvas"`.
* The desired width of the canvas element.
* The desired height of the canvas element.
* The background colour of your game, e.g. `"#000"`.

```javascript
var YourGame = function() {
  this.c = new Coquette(this, "canvas", 150, 150, "#000");
};
```

### Modules

When you instantiate Coquette, you get an object that has some modules. You can use these modules in your game.

#### Entities

Keeps track of all the entities in the game: the player, enemies, obstacles.

##### Define an entity

Most entities will have these attributes:

* `center`: The center of the entity, e.g. `{ x: 10, y: 20 }`
* `size`: The size of the entity, e.g. `{ x: 50, y: 30 }`
* `angle`: The orientation of the entity in degrees, e.g. `30`

And these methods:

* `update(timeSinceLastTick)`: Called every tick.  You should change the state of the entity in this method.
* `draw(canvasCtx)`: Called every tick.  You should draw the entity upright in this method.  The drawing will automatically get rotated to the orientation indicated by `angle`.

For example:

```javascript
var Block = function(game, settings) {
  this.game = game;
  this.center = settings.center;
  this.size = settings.size;
  this.angle = 30;
};

Block.prototype = {
  update: function(timeSinceLastTick) {
    this.center.x += 0.02 * timeSinceLastTick;
    this.center.y += 0.02 * timeSinceLastTick;
  },

  draw: function(canvasCtx) {
    ctx.fillStyle = "black";
    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  }
};

```

See the Collider section for instructions on enabling collision detection.

##### Create an entity

Call `c.entities.create()` with:

* The constructor function of the entity you want to create, e.g. `Block`.
* An optional settings object that will be passed into the constructor, e.g. `{ center: { x: 5, y: 10 }, size: { x: 10, y: 30 } }`.

Returns the created entity.

```javascript
var Block = function(game, settings) {
  this.game = game;
  this.center = settings.center;
  this.size = settings.size;
  this.angle = 0;
};

var myBlock = c.entities.create(Block, {
  center: { x: 5, y: 10 },
  size: { x: 10, y: 30 }
});
```

##### Destroy an entity

Call `c.entities.destroy()` with:

* The entity you want to destroy, e.g. `myBlock`.

```javascript
c.entities.destroy(myBlock);
```

##### Get all the entities in the game

```javascript
var all = c.entities.all();
```

##### Get all the entities of a certain type

```javascript
var invaders = c.entities.all(Invader);
```

#### Inputter

Handles keyboard and mouse input from the player.

##### Find out if a certain key or mouse button is down

```javascript
var leftArrowDown = c.inputter.isDown(c.inputter.LEFT_ARROW);
var rightMouseDown = c.inputter.isDown(c.inputter.RIGHT_MOUSE);
```

##### Find out if a certain key or mouse button is pressed

This returns true for the tick following the key going down.  In subsequent ticks, it returns false until the key is released and pressed down again.

```javascript
var leftArrowPressed = c.inputter.isPressed(c.inputter.LEFT_ARROW);
var rightMousePressed = c.inputter.isPressed(c.inputter.RIGHT_MOUSE);
```

##### Run a function every time the mouse is moved

```javascript
c.inputter.bindMouseMove(function(position) {
  console.log("The mouse is at", position.x, position.y);
});
```

`position` is relative to the game canvas.  If the mouse pointer is in the top left corner, position will be `{ x: 0, y: 0 }`.

##### Get the current mouse position

```javascript
var position = c.inputter.getMousePosition();
```

`position` is relative to the game canvas.  If the mouse pointer is in the top left corner, position will be `{ x: 0, y: 0 }`.

#### Renderer

Holds the canvas drawing context.  Calls `draw()` on the main game object and all the game entities.

##### Draw an entity

See the Define an Entity sub-section of the Entities section.

##### Get the canvas drawing context

```javascript
  var ctx = c.renderer.getCtx();
  ctx.fillStyle = "#f00";
  ctx.fillRect(0, 0, 10, 10);
```

##### Set the order that entities are drawn

When you create your entities, set an integer `zindex` attribute on them.  An entity with a higher `zindex` will get drawn on top of an entity with a lower `zindex`.  The default `zindex` is `0`.

```javascript
  var BackgroundTile = function() {
    this.zindex = -1;
  };

  var Player = function() {
    this.zindex = 0;
  };

  c.entities.create(BackgroundTile, {});
  c.entities.create(Player, {}); // drawn on top
```

##### Move the view

You can use `c.renderer.setViewCenter()` to move the view around the world.  For example, to make the view follow a specific object, you could call `setViewCenter(specificObj.center)` in the `update()` function of your game:

```javascript
  var Game = function() {
    var c = new Coquette(this, "canvas", 500, 500, "#000");
    var specialObject = c.entities.create(SpecialObject, {});

    this.update = function() {
      c.renderer.setViewCenter(specialObject.center);
    };
  };
```

#### Collider

Reports when entities collide.

##### Entity setup

To make an entity support collisions, put these attributes on it:

* `center`: The center of the entity, e.g. `{ x: 10, y: 20 }`.
* `size`: The size of the entity, e.g. `{ x: 50, y: 30 }`.
* `boundingBox`: The shape that best approximates the shape of the entity, either `c.collider.RECTANGLE` or `c.collider.CIRCLE`.
* `angle`: The orientation of the entity in degrees, e.g. `30`.

And, optionally, this method:

* `collision(other)`: Called when the entity collides with another entity.  Takes `other`, the other entity involved in the collision.

For example:

```javascript
var Player = function() {
  this.center = { x: 10, y: 20 };
  this.size = { x: 50, y: 50 };
  this.boundingBox = c.collider.CIRCLE;
  this.angle = 0;
};

Player.prototype = {
  collision: function(other) {
    console.log("Ow,", other, "hit me.");
  }
};
```

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests with:

    $ cd path/to/coquette
    $ npm install --dev
    $ npm test
