;(function(exports) {
  var Dot = exports.Dot = function() {
    this.size = { x: Dot.SIZE.x, y: Dot.SIZE.y };
  };

  Dot.SIZE = { x: 6, y: 6 };

  Dot.prototype = {
    acceleration: 0.0000003,

    update: function(delta) {
      var vec = flocker.getVector(this, this.flock.otherMembers(this), this.flock.center,
                                  this.acceleration, {
                                    orbit: 2, heading: 0.3, separation: 0.3, cohesion: 0.36
                                  });

      andro.eventer(this).emit('push:go', { vector: vec });
      this.body.drag(0.00001);
      this.body.update();
      andro.eventer(this).emit('owner:update');
    },

    draw: function(ctx) {
      this.game.drawer.startClip(ctx);
      this.game.drawer.circle(this.center, this.size.x / 2, undefined, this.color);
      this.game.drawer.endClip(ctx);
    },

    setupBehaviours: function() {
      andro.augment(this, passer, { from: "owner:destroy", to: "exploder:destroy" });
      andro.augment(this, push);
      andro.augment(this, destroy);
      andro.augment(this, exploder, {
        color: this.color,
        count: 10,
        maxLife: 1000,
        force: 0.00005,
        event: "destroy"
      });
    }
  };

  var PointsDot = exports.PointsDot = function(game, settings) {
    this.game = game;
    this.size = Maths.copyPoint(Dot.SIZE);
    this.color = "#fff700";
    this.body = createDotBody(this, settings);
    this.setupBehaviours();
  };

  PointsDot.prototype = new Dot();
  PointsDot.prototype.collision = function(other, type) {
    if (type === "add" && other instanceof Isla) {
      this.destroy();
    }
  };

  var HealthDot = exports.HealthDot = function(game, settings) {
    this.game = game;
    this.size = Maths.copyPoint(Dot.SIZE);
    this.color = "#ff2600";
    this.body = createDotBody(this, settings);
    this.setupBehaviours();
  };

  HealthDot.prototype = new Dot();
  HealthDot.prototype.collision = function(other, type) {
    if (type === "add" && other instanceof Isla) {
      other.receiveDamage(-1, this);
      this.destroy();
    }
  };

  var Stuka = exports.Stuka = function(game, settings) {};

  Stuka.prototype = {
    color: "#44f",

    update: function(delta) {
      if (this.game.stateMachine.state === "playing") {
        this.body.update();
        this.body.rotateTo(Maths.vectorToAngle(this.vec));

        var vec = flocker.getVector(this, this.flock.otherMembers(this), this.game.isla.center,
                                    this.acceleration, {
                                      orbit: 2, heading: 0, separation: 0.5, cohesion: 0.1
                                    });
        andro.eventer(this).emit('push:go', { vector: vec });
        this.body.drag(0.000015);

        andro.eventer(this).emit('owner:update');
      }
    },

    setupBehaviours: function(startHealth) {
      andro.augment(this, passer, { from: "owner:destroy", to: "exploder:destroy" });
      andro.augment(this, health, { health: startHealth });
      andro.augment(this, push);
      andro.augment(this, destroy);

      andro.augment(this, exploder, {
        color: this.color,
        count: 15,
        maxLife: 1000,
        force: 0.00005,
        event: "destroy"
      });
    },

    draw: function(ctx) {
      this.game.drawer.startClip(ctx);
      this.game.drawer.triangle(this.center, this.size.x, this.color);
      this.game.drawer.endClip(ctx);
    },

    collision: function(other, type) {
      if (type === "add" && other instanceof Isla) {
        other.receiveDamage(3, this);
        this.destroy();
      } else if (type === "add" &&
                 other instanceof Stuka) {
        this.destroy();
      }
    }
  };

  var SmallStuka = exports.SmallStuka = function(game, settings) {
    this.game = game;
    this.acceleration = 0.0000014;
    this.size = { x: 9, y: 9 };
    this.body = createStukaBody(this, utils.mixin(settings, { density: 0.35 }));
    this.setupBehaviours(1);
  };

  SmallStuka.prototype = new Stuka();

  var createStukaBody = function(entity, settings) {
    return game.physics.createSingleShapeBody(entity, {
      shape: "triangle",
      center: settings.center,
      size: entity.size,
      bullet: false,
      density: settings.density
    });
  };

  var createDotBody = function(entity, settings) {
    return game.physics.createSingleShapeBody(entity, {
      shape: "circle",
      center: settings.center,
      size: entity.size,
      bullet: false,
      density: 0.35,
      vec: { x: Math.random() / 100 - 0.005, y: Math.random() / 100 - 0.005 }
    });
  };
})(this);
