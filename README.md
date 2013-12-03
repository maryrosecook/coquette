# Coquette

A micro framework for JavaScript games.

Handles collision detection, the game update loop, canvas rendering, and keyboard and mouse input.

http://coquette.maryrosecook.com

* By Mary Rose Cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

## Get the code

* Minified: https://github.com/maryrosecook/coquette/coquette-min.js
* Single file: https://github.com/maryrosecook/coquette/coquette.js
* GitHub: https://github.com/maryrosecook/coquette
* `$ npm install coquette`

## Example

A game where you, the valiant player, must find a person of indeterminate gender in distress so you can take them away from all this.  The code appears in `demos/simple/`.

An HTML page that includes the Coquette library and the game code:

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
var Game = function(autoFocus) {
  var c = new Coquette(this, "canvas", 500, 150, "#000", autoFocus);

  c.entities.create(Person, { center: { x:250, y:40 }, color:"#099" }); // paramour
  c.entities.create(Person, { center: { x:256, y:110 }, color:"#f07", // player
    update: function() {
      if (c.inputter.isDown(c.inputter.UP_ARROW)) {
        this.center.y -= 0.4;
      }
    },

    collision: function(other) {
      other.center.y = this.center.y; // follow the player
    }
  });
};

var Person = function(_, settings) {
  for (var i in settings) {
    this[i] = settings[i];
  }

  this.size = { x:9, y:9 };
  this.draw = function(ctx) {
    ctx.fillStyle = settings.color;
    ctx.fillRect(this.center.x, this.center.y, this.size.x, this.size.y);
  };
};

window.addEventListener('load', function() {
  new Game();
});
```

## Reference

### Getting started

Instantiate Coquette, passing in:

* Your main game object.
* The ID of the canvas element, e.g. `"canvas"`.
* The desired width of the canvas element.
* The desired height of the canvas element.
* The background colour of your game, e.g. `"#000"`.

```javascript
var c = new Coquette(game, "canvas", 150, 150, "#000");
```

### Modules

When you instantiate Coquette, you get an object that has five modules. You can use these modules in your game.

#### Inputter

Handles keyboard input from the player.

##### Find out if a certain key is down

Call `c.inputter.down()`, passing in the key's code, e.g.:

```javascript
var down = c.inputter.down(c.inputter.LEFT_ARROW);
```

##### Find out if a certain key was pressed down and then released

Call `c.inputter.pressed()`, passing in the key's code, e.g.:

```javascript
var pressed = c.inputter.pressed(c.inputter.LEFT_ARROW);
```

#### Ticker

Does a tick - an iteration of the game update loop - sixty times a second.  If the main game object or a game entity has an `update()` function, it will get called on each tick.  If the main game object or a game entity has a `draw()` function, it will get called on each tick.

#### Renderer

Holds the canvas drawing context.  Calls `draw()` on the main game object and all game entities.

##### Get the canvas drawing context

```javascript
  var ctx = c.renderer.getCtx();
  ctx.fillStyle = "#f00";
  ctx.fillRect(0, 0, 10, 10);
```

##### Set the order that entities are drawn

When you create your entities, include some integer `zindex` attribute in the `settings` object.  An entity with a higher `zindex` will get drawn on top of an entity with a lower `zindex`.  The default `zindex` is `0`.

```javascript
  c.entities.create(BackgroundTile, { zindex: -1 });
  c.entities.create(Player, { zindex: 1 }); // drawn on top
```

##### Move the view

You can use `c.renderer.setViewCenter()` to move the position of the view around the world.  For example, to make the view follow a specific object, you could call `setViewCenter(specificObj.pos)` in the `update()` function of your game:

```javascript
  var Game = function() {
    var c = new Coquette(this, "canvas", 500, 500, "#000");
    var specialObject;
    c.entities.create(SpecialObject, {}, function(obj) {
      specialObject = obj;
    });

    this.update = function() {
      c.renderer.setViewCenter(specialObject.pos);
    };
  };
```

#### Entities

Keeps track of all game entities: the player, enemies.

##### Create an entity

Call `c.entities.create()` with:

* The constructor function of the object you want to create, e.g. `Bubble`.  When this constructor is called, it will get passed the main game object and a settings object.
* An optional settings object, e.g. `{ radius: 60 }`.
* An optional callback that will be called when the object is created.  This function will receive the created entity as an argument.

```javascript
var Bubble = function(game, settings) {
    this.game = game;
    this.radius = settings.radius;
};

var myBubble;
c.entities.create(Bubble, {
  radius: 60
}, function(bubble) {
  myBubble = bubble;
});
```

When you create an entity with the `Entities` module, the entity will not actually get created until the next tick.  This avoids logical and collision detection problems that arise from creating an entity mid-tick.

##### Destroy an entity

Call `c.entities.destroy()` with:

* The entity you want to destroy, e.g. `bubble`.
* An optional callback that will be called when the object is destroyed.

```javascript
c.entities.destroy(bubble, function() {
  console.log("boom");
});
```

When you destroy an entity, it will not actually get destroyed until the next tick.  This avoids logical and collision detection problems that arise from destroying an entity mid-tick.

##### Get all the entities in the game

```javascript
var all = c.entities.all();
```

##### Get all the entities of a certain type

```javascript
var player = c.entities.all(Player)[0];
```

#### Collider

Reports when two entities collide.

##### Entity setup

To make an entity support collisions, put these attributes on it:

* `pos`: the top left corner of the entity, e.g.: `{ x: 10, y: 20 }`.
* `size`: the size of the entity, e.g.: `{ x: 50, y: 30 }`.
* `boundingBox`: the shape that best approximates the shape of the entity, either `c.collider.RECTANGLE` or `c.collider.CIRCLE`.

And, optionally, these methods:

* `collision(other, type)`: called when the entity collides with another entity.  Takes `other`, the other entity involved in the collision.  Takes `type`, which will be `c.collider.INITIAL`, if the entities were not colliding in the previous tick, or `c.collider.SUSTAINED`, if the entities were colliding in the previous tick.
* `uncollision(other)`: called when the entity stops colliding with another entity.  Takes `other`, the other entity involved in the collision.

e.g.:

```javascript
var Player = function() {
  this.pos = { x: 10, y: 20 };
  this.size = { x: 50, y: 30 };
  this.boundingBox = c.collider.CIRCLE;

  this.collision = function(other, type) {
    if (type === c.collider.INITIAL) {
      console.log("Ow,", other, "hit me.");
    } else if (type === c.collider.SUSTAINED) {
      console.log("Ow,", other, "is still hitting me.");
    }
  };

  this.uncollision = function(other) {
    console.log("Phew,", other, "has stopped hitting me.");
  };
};
```

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests with:

    $ cd path/to/coquette
    $ npm install --dev
    $ npm test
