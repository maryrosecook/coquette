0.2.1 / 2013-11-19

* [BREAKING CHANGE] Several object attributes renamed to discourage use from outside:

  * runner.runs to _runs

  * renderer.backgroundColor to _backgroundColor

  * renderer.viewCenterPos to _viewCenterPos

  * renderer.viewSize to _viewSize

  * collider.collideRecords to _collideRecords

0.2.1 / 2013-09-20

* [NEW] Entities no longer need to have a `pos` and `size`. If they are missing either, they will be ignored when checking for collisions.

0.2.0 / 2013-09-14

* [BREAKING CHANGE] `width` and `height` of view are no longer stored as separate attributes on `renderer` instance.  They are stored inside `renderer.viewSize`.

* [NEW] Find out whether a key was pressed (up and down) with `coquette.inputter.pressed(keyCode)`.

* [NEW] Move view position in around the world with `coquette.renderer.setViewCenterPos(pos)`.

* [CHANGE] `coquette.inputter` function to find out whether a key is down is now called `down()`. `state()` still works.

* [FIX] Nasty bug where uncollisions would sometimes not get fired when z indices were in use.
