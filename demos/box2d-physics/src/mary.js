;(function(exports) {
  exports.Mary = function(game, settings) {
    this.game = game;
    this.zindex = 0;
    this.color = "#fff";
    this.angle = 180;
    this.body = game.physics.createSingleShapeBody(this, {
      shape: "circle",
      center: settings.center,
      size: { x: 20, y: 20 },
      density: 0.4,
      fixedRotation: true
    });

    andro.augment(this, destroy);
    andro.augment(this, push);

    andro.augment(this, passer, { from: "owner:destroy", to: "exploder:destroy" });
    andro.augment(this, exploder, {
      color: this.color,
      count: 30,
      maxLife: 1000,
      force: 0.00005,
      event: "destroy"
    });
  };

  exports.Mary.prototype = {
    SPEED: 0.0002,
    SPEED_LIMIT: 0.1,
    DRAG_RATIO: 0.005,

    update: function(delta) {
      this.handleKeyboardInput();
      this.body.update();
      this.body.drag(this.DRAG_RATIO);
      andro.eventer(this).emit('owner:update');
    },

    collision: function(other, type) {
      if (type === "add" && other instanceof Stuka) {
        other.receiveDamage(3, this);
      }
    },

    islaPullAcceleration: 0.0005,
    handleKeyboardInput: function() {
      if (this.game.stateMachine.state === "playing") {
        var inputter = this.game.c.inputter;
        var vec = { x: 0, y: 0 };

        if (inputter.isDown(inputter.LEFT_ARROW)) {
          vec.x = -this.SPEED;
        } else if (inputter.isDown(inputter.RIGHT_ARROW)) {
          vec.x = this.SPEED
        }

        if (inputter.isDown(inputter.UP_ARROW)) {
          vec.y = -this.SPEED;
        } else if (inputter.isDown(inputter.DOWN_ARROW)) {
          vec.y = this.SPEED;
        }

        if (inputter.isPressed(inputter.D)) {
          this.game.isla.destroy();
        }

        var unitVec = Maths.unitVector(vec);
        var pushVec = {
          x: unitVec.x * this.SPEED,
          y: unitVec.y * this.SPEED,
        };

        this.body.push(pushVec)
      }
    },

    draw: function(ctx) {
      this.game.drawer.startClip(ctx);
      this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.color);
      this.game.drawer.endClip(ctx);
    }
  };
})(this);
