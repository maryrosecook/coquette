;(function(exports) {
  var Director = function(game) {
    this.game = game;
    this.buildQueue = new BuildQueue();
    this.reset();
  };

  Director.MIN_DOT_SPAWN_DISTANCE = 1500;
  Director.MIN_STUKA_SPAWN_DISTANCE = 800;

  Director.prototype = {
    update: function(__) {
      if (this.game.stateMachine.state !== "playing") return;

      var self = this;

      if (this.flockCount(PointsDot) < 1) {
        this.isStageInProgress = false;
        this.buildQueue.add(PointsDot, delay=2000, function(createFn) {
          self.isStageInProgress = true;
          self.stage++;
          var flock = game.c.entities.create(Flock, {
            center: flockSpawnPoint(self.game.c.renderer,
                                    game.isla.center,
                                    Director.MIN_DOT_SPAWN_DISTANCE)
          });

          onIslaFirstDot(self.game, self.game.isla, flock, function() {
            createSmallStukaFlock(self, delay=0);
          });

          flock.stage = self.stage;

          self.createFlockMembers(self.game, flock, count=self.stage, createFn, {});
        });
      }

      if (this.stage > 3 &&
          this.flockCount(HealthDot) < 1 &&
          this.lastHealthFlockStage < this.stage) {
        this.lastHealthFlockStage = this.stage;
        createHealthFlock(this);
      }

      this.buildQueue.update();
    },

    start: function() {
      var flock = game.c.entities.create(Flock, {
        minDistance: 100,
        center: {
          x: this.game.drawer.getHome().x + 88,
          y: this.game.drawer.getHome().y + 88
        }
      });

      this.createFlockMembers(this.game, flock, 1, PointsDot, {});
    },

    reset: function() {
      this.stage = 1;
      this.isStageInProgress = true;
      this.lastHealthFlockStage = 1
      this.buildQueue.clear();
    },

    destroyAll: function() {
      _.invoke(this.game.c.entities.all(Dot), "destroy");
      _.invoke(this.game.c.entities.all(Stuka), "destroy");
    },

    flockCount: function(createFn) {
      return _.filter(this.game.c.entities.all(Flock), function(x) {
        return x.members.length > 0 && x.members[0] instanceof createFn;
      }).length +
      _.filter(this.buildQueue.all(), function(x) {
        return x.type === createFn;
      }).length;
    },

    createFlockMembers: function(game, flock, count, Bird, generalBirdSettings) {
      _.times(count, function() {
        var birdSettings = { center: flock.center };
        utils.mixin(generalBirdSettings, birdSettings);
        var bird = game.c.entities.create(Bird, birdSettings);

        while (!game.physics.freeSpace(bird)) {
          bird.body.move(Maths.surroundingSpawnPoint(flock.center, 100));
        }

        flock.add(bird);
      });
    }
  };

  var BuildQueue = function() {
    var queue = [];

    this.add = function(createFn, delay, fn) {
      queue.push({
        type: createFn,
        time: new Date().getTime() + delay,
        run: function() {
          fn(createFn);
          this.clear();
        },

        clear: function() {
          queue.splice(queue.indexOf(this), 1);
        }
      });
    };

    this.all = function() {
      return queue.concat();
    };

    this.clear = function() {
      queue = [];
    };

    this.update = function() {
      if (queue[0] !== undefined) { // do one build at a time so can splice safely
        if (new Date().getTime() > queue[0].time) {
          queue[0].run();
        }
      }
    };
  };

  var createHealthFlock = function(director) {
    director.buildQueue.add(HealthDot, delay=1000, function(createFn) {
      var flock = game.c.entities.create(Flock, {
        center: flockSpawnPoint(director.game.c.renderer,
                                game.isla.center,
                                Director.MIN_DOT_SPAWN_DISTANCE)
      });

      onIslaFirstDot(director.game, director.game.isla, flock, function() {
        createSmallStukaFlock(director, delay=0);
      });

      director.createFlockMembers(director.game, flock, count=5, createFn, {});
    });
  };

  var createSmallStukaFlock = function(director, delay) {
    director.buildQueue.add(SmallStuka, delay, function(createFn) {
      var flock = game.c.entities.create(Flock, {
        center: flockSpawnPoint(director.game.c.renderer,
                                game.isla.center,
                                Director.MIN_STUKA_SPAWN_DISTANCE)
      });

      director.createFlockMembers(director.game, flock, count=director.stage, createFn, {});
    });
  };

  var flockSpawnPoint = function(renderer, center, minDistance) {
    var point = Maths.surroundingSpawnPoint(center, minDistance);
    return renderer.onScreen({ center: point, size: { x: 1, y: 1 } }) ?
      flockSpawnPoint.apply(null, arguments) :
      point;
  };

  var onIslaFirstDot = function(game, isla, flock, fn) {
    andro.eventer(flock).bind(fn, "owner:memberDestroyed", function() {
      if (game.stateMachine.state === "playing") { // only respond if game still going
        fn();
      }

      andro.eventer(flock).unbind(fn, "owner:memberDestroyed");
    });
  };

  exports.Director = Director;
}(this));
