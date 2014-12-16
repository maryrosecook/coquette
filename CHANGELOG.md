0.5.8 / 2014-12-16

[FIX] Mouse coordinates are now correct when window is scrolled.

0.5.7 / 2014-12-15

[FIX] Mouse coordinates are now correct for a canvas that has a parent that is "position:relative".  (Thanks, cdosborn.)

0.5.5 / 2014-12-15

[NEW] Add Racecar demo.

0.5.2 / 2014-12-01

[FIX] Fix Left Right Space to destroy ALL asteroids in group when one member hit with bullet.

0.5.1 / 2014-12-01

[FIX] Typo in docs.

0.5.0 / 2014-12-01

[BREAKING CHANGE] Coquette no longer distingishes between initial collisions and sustained collisions.  `collision()` is still called for every tick that an entity intersects with another entity, but no collision type is passed.

[BREAKING CHANGE] Coquette no longer calls `"uncollision()` on entities.

0.4.5 / 2014-09-12

[FIX] Spinning shapes demo uses relative paths for script loading. (Thanks, douglascalhoun.)

[FIX] Box2D demo uses relative paths for script loading.

0.4.4 / 2014-06-26

[FIX] Remove unused callback params from `entities.create()` and `entities.destroy()`.

0.4.3 / 2014-03-07

[FIX] Draw people in correct place in simple demo.  (Thanks, tmcw.)

0.4.1 / 2014-03-01

[NEW] Demo that uses Box2D physics engine.

0.3.1 / 2014-01-04

[BREAKING CHANGE] Callback no longer called when entity created.

[BREAKING CHANGE] Callback no longer called when entity destroyed.

[NEW] c.entities.create() immediately creates and returns new entity. Does not wait for next tick.

[NEW] c.entities.destroy() immediately destroys entity. Does not wait for next tick.

0.3.0 / 2013-12-02

[BREAKING CHANGE] The `center` attribute on an entity is now used to indicate the entity's position (center). This replaces the `pos` attribute.

[BREAKING CHANGE] `c.inputter.state()` no longer supported. Replaced by `c.inputter.isDown()`.

[BREAKING CHANGE] `c.inputter.down()` is now called `c.inputter.isDown()`.

[BREAKING CHANGE] `c.inputter.pressed()` is now called `c.inputter.isPressed()`.

[BREAKING CHANGE] `c.renderer.getViewCenterPos()` is now called `c.renderer.getViewCenter()`.

[BREAKING CHANGE] `c.renderer.setViewCenterPos()` is now called `c.renderer.setViewCenter()`.

[BREAKING CHANGE] The `c.collider.POINT` bounding box is no longer supported.

[NEW] Collision detection works for rotated entities with a `c.collider.RECTANGLE` bounding boxes.  (Orientation doesn't matter for entities with a `c.collider.CIRCLE` bounding box.) Set an `angle` attribute on a rectangular entity to indicate its orientation in degrees.  It will get checked for collisions at that orientation.

[NEW] Entities that rotate get drawn at the right orientation.  Set an `angle` attribute on an entity to indicate its orientation in degrees.  Draw it upright.  The drawing will get rotated to the correct orientation.

[NEW] Input from mouse clicks and mouse moves is supported.

[NEW] Spinning shapes demo demonstrating mouse move input and collision detection for rotated entities.  Running on the Coquette homepage.

0.2.1 / 2013-11-19

[BREAKING CHANGE] Several object attributes renamed to discourage use from outside:

  * runner.runs to _runs

  * renderer.backgroundColor to _backgroundColor

  * renderer.viewCenterPos to _viewCenterPos

  * renderer.viewSize to _viewSize

  * collider.collideRecords to _collideRecords

0.2.1 / 2013-09-20

[NEW] Entities no longer need to have a `pos` and `size`. If they are missing either, they will be ignored when checking for collisions.

0.2.0 / 2013-09-14

[BREAKING CHANGE] `width` and `height` of view are no longer stored as separate attributes on `renderer` instance.  They are stored inside `renderer.viewSize`.

[NEW] Find out whether a key was pressed (up and down) with `coquette.inputter.pressed(keyCode)`.

[NEW] Move view position in around the world with `coquette.renderer.setViewCenterPos(pos)`.

[CHANGE] `coquette.inputter` function to find out whether a key is down is now called `down()`. `state()` still works.

[FIX] Nasty bug where uncollisions would sometimes not get fired when z indices were in use.
