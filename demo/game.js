;(function(exports) {
  var Game = function(canvasId, width, height) {
    this.renderer = new Renderer(canvasId, width, height);
    this.inputter = new Inputter();
    this.maths = new Maths();
    this.updater = new Updater();
    this.entityer = new Entityer();
    this.runner = new Runner();
    this.collider = new Collider();

    this.updater.add(this.collider);
    this.updater.add(this.entityer);
    this.updater.add(this.runner);

    this.STATE = {
      INTRO: 0,
      PLAYING: 1,
      OVER: 2
    };

    this.state = this.STATE.INTRO;

    this.introImage = new Image();
    this.introImage.src = '../demo/intro.png';
  };

  Game.prototype = {
    entities: [],
    player: null,
    maxScore: 30,

    init: function() {
      this.player = game.entityer.add(Player, {
        pos: { x:0, y:0 }
      });
    },

	  update: function() {
      if (this.state === this.STATE.PLAYING) {
        if (this.score() <= 0) {
          this.state = this.STATE.OVER;
        }
      } else if (this.state === this.STATE.INTRO || this.state === this.STATE.OVER) {
        if(this.inputter.state(Inputter.SPACE)) {
          var asteroids = game.entityer.all(Asteroid);
          for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].kill();
          }

          for (var i = 0; i < 3; i++) {
            this.entityer.add(Asteroid, {
              pos: {
                x: Math.random() * this.renderer.width,
                y: Math.random() * this.renderer.height
              }
            });
          }

          this.state = this.STATE.PLAYING;
        }
      }
      this.draw();
	  },

	  draw: function() {
      this.renderer.clear("#000");
      if (this.state === this.STATE.PLAYING) {
        for (var i = 0; i < this.maxScore; i++) {
          var rAngle = game.maths.degToRad(360 / this.maxScore * i);
          var pos = {
            x: game.renderer.width / 2 + Math.sin(rAngle) * 30,
            y: game.renderer.height / 2 + Math.cos(rAngle) * 30
          };

          if (i > this.score() - 1) {
            game.renderer.circle(pos, 0.5, "#222");
          } else {
            game.renderer.circle(pos, 0.5, "#666");
          }
        }
      } else {
        this.renderer.ctx.drawImage(this.introImage,
                                    this.renderer.width / 2 - 100,
                                    this.renderer.height / 2 - 50);
      }
	  },

    score: function() {
      return this.maxScore - this.entityer.all(Asteroid).length;
    },
  };

  exports.Game = Game;
})(this);
