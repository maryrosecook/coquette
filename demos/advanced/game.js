;(function(exports) {
  var Game = function(canvasId, width, height) {
    this.coquette = new Coquette(this, canvasId, width, height, "#000");

    this.maths = new Maths();
    this.STATE = {
      INTRO: 0,
      PLAYING: 1,
      OVER: 2
    };

    this.state = this.STATE.INTRO;

    this.introImage = new Image();
    this.introImage.src = 'intro.png';
  };

  Game.prototype = {
    player: null,
    maxScore: 30,

    init: function() {
      var self = this;
      this.coquette.entities.create(Player, {
        pos: { x:0, y:0 }
      }, function(player) {
        self.player = player;
      });
    },

    update: function() {
      if (this.state === this.STATE.PLAYING) {
        if (this.score() <= 0) {
          this.state = this.STATE.OVER;
        }
      } else if (this.state === this.STATE.INTRO || this.state === this.STATE.OVER) {
        if(this.coquette.inputter.state(this.coquette.inputter.SPACE)) {
          var asteroids = this.coquette.entities.all(Asteroid);
          for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].kill();
          }

          for (var i = 0; i < 3; i++) {
            this.coquette.entities.create(Asteroid, {
              pos: {
                x: Math.random() * this.coquette.renderer.width,
                y: Math.random() * this.coquette.renderer.height
              }
            });
          }

          this.state = this.STATE.PLAYING;
        }
      }
    },

    draw: function() {
      if (this.state === this.STATE.PLAYING) {
        for (var i = 0; i < this.maxScore; i++) {
          var rAngle = this.maths.degToRad(360 / this.maxScore * i);
          var pos = {
            x: this.coquette.renderer.width / 2 + Math.sin(rAngle) * 30,
            y: this.coquette.renderer.height / 2 + Math.cos(rAngle) * 30
          };

          if (i > this.score() - 1) {
            this.circle(pos, 0.5, "#222");
          } else {
            this.circle(pos, 0.5, "#666");
          }
        }
      } else {
        this.coquette.renderer.getCtx().drawImage(this.introImage,
                                                  this.coquette.renderer.width / 2 - 100,
                                                  this.coquette.renderer.height / 2 - 50);
      }
    },

    circle: function(pos, radius, color) {
      var ctx = this.coquette.renderer.getCtx();
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x + radius, pos.y + radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
    },

    startClip: function() {
      var ctx = this.coquette.renderer.getCtx();
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.coquette.renderer.width / 2, this.coquette.renderer.height / 2,
              this.coquette.renderer.width / 2 , 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    },

    endClip: function() {
      this.coquette.renderer.getCtx().restore();
    },

    score: function() {
      return this.maxScore - this.coquette.entities.all(Asteroid).length;
    },
  };

  exports.Game = Game;
})(this);
