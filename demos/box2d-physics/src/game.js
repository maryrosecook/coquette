;(function(exports) {
  exports.Game = function() {
    this.c = new Coquette(this, "canvas", 600, 600, "#000");
    this.c.collider.update = function() {}; // collision notifications handled by box2d

    this.drawer = new Drawer(this, this.c.renderer.getCtx());
    this.physics = new Physics(this, { x: 0, y: 0 });
    this.director = new Director(this);
    this.radar = new Radar(this);
    this.c.renderer.setViewCenter(this.drawer.getHome());

    this.stateMachine = new StateMachine({
      "": ["started"],
      started: ["playing"],
      playing: ["gameOver"],
      gameOver: ["playing"]
    });

    this.particleGhosts = new RandomRemovalBuffer(500);

    var self = this;
    this.setupImages(function () {
      self.stateMachine.transition("started");
      self.restartGame();
    });
  };

  exports.Game.prototype = {
    update: function(delta) {
      this.physics.update(delta);

      if (this.stateMachine.state === "playing") {
        this.director.update(delta);
        this.drawer.moveViewTowards(this.mary.center, 0.1);
      } else if (this.stateMachine.state === "started") {
        this.drawer.moveViewTowards(this.mary.center, 0.07);
        this.listenForStartKey();
      } else if (this.stateMachine.state === "gameOver") {
        this.drawer.moveViewTowards(this.mary.center, 0.07);
        this.listenForStartKey();
      }
    },

    listenForStartKey: function() {
      if (this.c.inputter.isPressed(this.c.inputter.LEFT_ARROW) ||
          this.c.inputter.isPressed(this.c.inputter.RIGHT_ARROW) ||
          this.c.inputter.isPressed(this.c.inputter.UP_ARROW) ||
          this.c.inputter.isPressed(this.c.inputter.DOWN_ARROW)) {
        this.stateMachine.transition("playing");
      }
    },

    setupImages: function(callback) {
      var self = this;
      images.load({
        keys: { url: "./images/keys.png", size: { x: 200, y: 200 } },
      }, function(images) {
        self.images = images;
        self.images.keys.center = { x: 190, y: 158 };
        callback();
      });
    },

    restartGame: function() {
      var viewSize = this.c.renderer.getViewSize();
      var home = this.drawer.getHome();

      this.mary = this.c.entities.create(Mary, {
        center: { x: home.x, y: home.y }
      });

      this.isla = this.c.entities.create(Isla, {
        center: { x: home.x - 88, y: home.y - 88 }
      });

      var self = this;
      andro.augment(this.isla, {
        setup: function(__, eventer) {
          eventer.bind(this, "owner:destroy", function() {
            setTimeout(function() {
              self.mary.destroy();
              self.director.reset();
              self.director.destroyAll();

              self.stateMachine.transition("gameOver");

              setTimeout(function() {
                self.restartGame();
              }, 1000);
            }, 500);
          });
        }
      });

      this.director.start();
    },

    draw: function(ctx) {
      this.drawer.startClip(ctx);

      if (this.stateMachine.state !== "") {
        if (this.stateMachine.state === "started") {
          this.images.keys.draw(ctx);
        } else if (this.stateMachine.state === "playing") {
          this.physics.draw();
          this.radar.draw(ctx);
        }
      }

      var ghosts = this.particleGhosts.all();
      for (var i = 0, len = ghosts.length; i < len; i++) {
        this.drawer.circle(ghosts[i].center, 0.5, undefined, ghosts[i].color);
      }

      this.drawer.endClip(ctx);
    }
  };
})(this);
