;(function(exports) {
  var Game = function(canvasId, width, height) {
    this.c = new Coquette(this, canvasId, width, height, "#000");

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
      this.player = this.c.entities.create(Player, {
        center: { x:0, y:0 }
      });
    },

    update: function() {
      if (this.state === this.STATE.PLAYING) {
        if (this.score() <= 0) {
          this.state = this.STATE.OVER;
        }
      } else if (this.state === this.STATE.INTRO || this.state === this.STATE.OVER) {
        if(this.c.inputter.isDown(this.c.inputter.SPACE)) {
          var asteroids = this.c.entities.all(Asteroid);
          for (var i = 0; i < asteroids.length; i++) {
            this.c.entities.destroy(asteroids[i]);
          }

          for (var i = 0; i < 3; i++) {
            this.c.entities.create(Asteroid, {
              center: {
                x: Math.random() * this.c.renderer.getViewSize().x,
                y: Math.random() * this.c.renderer.getViewSize().y
              }
            });
          }

          this.state = this.STATE.PLAYING;
        }
      }
    },

    draw: function(ctx) {
      if (this.state === this.STATE.PLAYING) {
        for (var i = 0; i < this.maxScore; i++) {
          var rAngle = this.maths.degToRad(360 / this.maxScore * i);
          var center = {
            x: this.c.renderer.getViewSize().x / 2 + Math.sin(rAngle) * 30,
            y: this.c.renderer.getViewSize().y / 2 + Math.cos(rAngle) * 30
          };

          if (i > this.score() - 1) {
            this.circle(center, 0.5, "#222");
          } else {
            this.circle(center, 0.5, "#666");
          }
        }
      } else {
        ctx.drawImage(this.introImage,
                      this.c.renderer.getViewSize().x / 2 - 100,
                      this.c.renderer.getViewSize().y / 2 - 50);
      }
    },

    circle: function(center, radius, color) {
      var ctx = this.c.renderer.getCtx();
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.stroke();
    },

    startClip: function(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.c.renderer.getViewSize().x / 2,
              this.c.renderer.getViewSize().y / 2,
              this.c.renderer.getViewSize().x / 2 , 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    },

    endClip: function(ctx) {
      ctx.restore();
    },

    score: function() {
      return this.maxScore - this.c.entities.all(Asteroid).length;
    },
  };

  exports.Game = Game;
})(this);
