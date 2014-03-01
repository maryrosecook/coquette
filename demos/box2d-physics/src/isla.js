;(function(exports) {
  var MAX_HEALTH = 15;

  exports.Isla = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#ff2600";
    this.body = game.physics.createSingleShapeBody(this, {
      shape: "circle",
      center: settings.center,
      size: { x: MAX_HEALTH, y: MAX_HEALTH },
      density: 0.6,
      fixedRotation: true
    });

    andro.augment(this, pulse, { rgb: [255, 0, 0], colorsToCycle: [1, 0, 0], minBrightness: 75 });
    andro.augment(this, health, { health: MAX_HEALTH });
    andro.augment(this, destroy);
    andro.augment(this, push);
    andro.augment(this, follow, { acceleration: 0.00003 });
    andro.augment(this, home, {
      acceleration: 0.000020,
      turnSpeed: 0.004
    });

    andro.augment(this, passer, { from: "owner:destroy", to: "exploder:destroy" });
    andro.augment(this, exploder, {
      color: this.color,
      count: 30,
      maxLife: 1000,
      force: 0.00005,
      event: "destroy"
    });

    andro.augment(this, passer, { from: "health:receiveDamage", to: "exploder:damage" });
    andro.augment(this, exploder, {
      color: this.color,
      count: 3,
      maxLife: 1000,
      force: 0.00005,
      event: "damage"
    });

    andro.augment(this, {
      setup: function(owner, eventer) {
        eventer.bind(this, "health:receiveDamage", function() {
          eventer.emit("pulse:stop");
          if (owner.getHealth() <= 6) {
            owner.destroy();
            return;
          } else if (owner.getHealth() <= 9) {
            eventer.emit("pulse:start", { speed: 15 });
          } else if (owner.getHealth() < 15) {
            eventer.emit("pulse:start", { speed: 5 });
          }

          owner.body.setSize({ x: owner.getHealth(), y: owner.getHealth() });
        });
      }
    });

    // targeting - dots or mary
    andro.augment(this, {
      birdRange: this.game.c.renderer.getViewSize().x / 2,
      maryPullAcceleration: 0.000002,

      setup: function(owner, eventer) {
        this.owner = owner;

        // acquire target
        eventer.bind(this, "owner:update", function() {
          owner.target = this.getTarget();
        });

        // move towards target
        eventer.bind(this, "owner:update", function() {
          if (owner.target instanceof Mary) {
            andro.eventer(owner).emit("follow:go", owner.target);
          } else if (owner.target instanceof Dot) {
            andro.eventer(owner).emit("home:go", owner.target);

            // also pull towards mary a little
            if (owner.game.c.inputter.isDown(owner.game.c.inputter.SPACE)) {
              var toMaryUnit = Maths.unitVector({
                x: owner.game.mary.center.x - owner.center.x,
                y: owner.game.mary.center.y - owner.center.y
              });

              owner.body.push({
                x: toMaryUnit.x * this.maryPullAcceleration,
                y: toMaryUnit.y * this.maryPullAcceleration
              });
            }
          }
        });
      },

      getTarget: function() {
        if (this.owner.target instanceof Dot &&
            isAlive(this.owner.target) &&
            Maths.distance(this.owner.center, this.owner.target.center) <
              this.birdRange) {
          return this.owner.target; // keep this bird as target
        } else if (this.owner.target === undefined ||
                   this.owner.target instanceof Mary) {
          var target = closest(this.owner, game.c.entities.all(Dot));
          if (target !== undefined &&
              Maths.distance(this.owner.center, target.center) <
                this.birdRange) { // switch to bird if one in range of isla
            return target;
          }
        }

        if (this.owner.game.c.renderer.onScreen(this.owner)) {
          return this.owner.game.mary;
        }
      }
    });
  };

  var closest = function(entity, entities) {
    return entities.sort(function(a, b) {
      return Maths.distance(a.center, entity.center) - Maths.distance(b.center, entity.center);
    })[0];
  };

  var isAlive = function(entity) {
    var all = game.c.entities.all();
    for (var i = 0, len = all.length; i < len; i++) {
      if (all[i] === entity) {
        return true;
      }
    }
    return false;
  };

  exports.Isla.prototype = {
    DRAG_RATIO: 0.0005,

    update: function(delta) {
      this.body.update();
      this.body.drag(this.DRAG_RATIO);
      if (this.game.stateMachine.state === "playing") {
        andro.eventer(this).emit('owner:update');
      }
    },

    collision: function(other) {
      if (other instanceof Dot) {
        andro.eventer(this).emit("gotDot", other);
        andro.eventer(this).emit("home:stop");
      }
    },

    draw: function(ctx) {
      this.game.drawer.startClip(ctx);
      this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.getCurrentColor());
      this.game.drawer.endClip(ctx);
    }
  };
})(this);
