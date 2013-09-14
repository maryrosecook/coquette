0.2.0 / 2013-09-14

* Breaking change.  `width` and `height` of view are no longer stored as separate attributes on `renderer` instance.  They are stored inside `renderer.viewSize`.

* Find out whether a key was pressed (up and down) with `coquette.inputter.pressed(keyCode)`.

* Move view position in around the world with `coquette.renderer.setViewCenterPos(pos)`.

* `coquette.inputter` function to find out whether a key is down is now called `down()`.  `state()` still works.

* Fixed nasty bug where uncollisions would sometimes not get fired when z indices were in use.
