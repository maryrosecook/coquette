# Coquette

A micro framework for JavaScript games.

Handles collision detection, the game update loop, keyboard input and canvas rendering.

http://coquette.maryrosecook.com

* By Mary Rose Cook
* http://maryrosecook.com
* maryrosecook@maryrosecook.com

## Get the code

    $ git clone git://github.com/maryrosecook/coquette.git

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
```

## Run the tests

Install Node.js and npm: https://github.com/isaacs/npm

Install the node dependencies and run the tests with:

    $ cd path/to/coquette
    $ npm install --dev
    $ npm test

## Reference

### Getting started

Instantiate Coquette, passing in:

* Your main game object.
* The ID of the canvas element, e.g. `"canvas"`.
* The desired width of the canvas element.
* The desired height of the canvas element.
* The background colour of your game, e.g. `"#000"`.

```javascript
var coquette = new Coquette(game, "canvas", 150, 150, "#000");
```

### Modules

When you instantiate Coquette, you get an object that has five modules. You can use these modules in your game.

#### Inputter

Handles keyboard input from the player.

##### Find out if a certain key is pressed

Call `coquette.inputter.state()`, passing in the key's code, e.g.:

```javascript
var pressed = coquette.inputter.state(coquette.inputter.LEFT_ARROW);
```

#### Updater

Calls `update()` and `draw()` on every object added to it.

Objects are added to the `Updater` module.  Each tick - each sixtieth of a second or so - the module calls the `update()` function, if it exists, on each object, then calls the `draw()` function, if it exists, on each object.

The main game object is automatically added to the `Updater` module.  Its `update()` and `draw()` functions are called before any other entity's.

Any object created with the `Entities` module is automatically added to the `Updater` module.

#### Renderer

##### Get the canvas drawing context

```javascript
var ctx = coquette.renderer.getCtx();
ctx.fillStyle = "#f00";
ctx.fillRect(0, 0, 10, 10);
```

#### Entities

Keeps track of all game entities: the player, enemies.

##### Create an entity

When you create an entity with the `Entities` module, the entity will not actually get created until the next tick.  This avoids logical and collision detection problems that arise from creating an entity mid-tick.

When you create an entity, it is automatically added to the `Updater` module.

Call `coquette.entities.create()` with:

* The constructor function of the object you want to create, e.g. `Bubble`.  When this constructor is called, it will get passed the main game object and a settings object.
* An optional settings object, e.g. `{ radius: 60 }`.
* An optional callback that will be called when the object is created.  This function will receive the created entity as an argument.

```javascript
var Bubble = function(game, settings) {
    this.game = game;
    this.radius = settings.radius;
};

var myBubble;
coquette.entities.create(Bubble, {
  radius: 60
}, function(bubble) {
  myBubble = bubble;
});
```

##### Destroy an entity

When you destroy an entity, it will not actually get destroyed until the next tick.  This avoids logical and collision detection problems that arise from destroying an entity mid-tick.

When you destroy an entity, it is automatically removed from the `Updater` module.

Call `coquette.entities.destroy()` with:

* The entity you want to destroy, e.g. `bubble`.
* An optional callback that will be called when the object is destroyed.

```javascript
coquette.entities.destroy(bubble, function() {
  console.log("boom");
});
```

##### Get all the entities in the game

```javascript
var all = coquette.entities.all();
```

##### Get all the entities of a certain type

```javascript
var player = coquette.entities.all(Player)[0];
```

#### Collider

Reports when two entities collide.

##### Entity setup

To make an entity support collisions, put these attributes on it:

* `pos`: the top left position of the entity, e.g.: `{ x: 10, y: 20 }`.
* `size`: the size of the entity, e.g.: `{ x: 50, y: 30 }`.
* `boundingBox`: the shape that best approximates the shape of the entity, either `coquette.collider.RECTANGLE` or `coquette.collider.CIRCLE`.

And, optionally, these methods:

* `collision(other, type)`: called when the entity collides with another entity.  Takes `other`, the other entity involved in the collision.  Takes `type`, which will be `coquette.collider.INITIAL`, if the entities were not colliding in the previous tick, or `coquette.collider.SUSTAINED`, if the entities were colliding in the previous tick.
* `uncollision(other)`: called when the entity stops colliding with another entity.  Takes `other`, the other entity involved in the collision.

e.g.:

```javascript
var Player = function() {
  this.pos = { x: 10, y: 20 };
  this.size = { x: 50, y: 30 };
  this.boundingBox = coquette.collider.CIRCLE;

  this.collision = function(other, type) {
    if (type === coquette.collider.INITIAL) {
      console.log("Ow,", other, "hit me.");
    } else if (type === coquette.collider.SUSTAINED) {
      console.log("Ow,", other, "is still hitting me.");
    }
  };

  this.uncollision = function(other) {
    console.log("Phew,", other, "has stopped hitting me.");
  };
};
```
