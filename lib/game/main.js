ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',
  'game.entities.asteroid',
  'game.levels.a'
)
.defines(function(){
  MyGame = ig.Game.extend({
    gravity: 0,
	  clearColor: '#000',
    player: null,

    // sounds
    // bulletHitSound: new ig.Sound('media/sounds/bullethumanhit.*', true),

	  font: new ig.Font( 'media/download.png' ),

	  init: function() {
	    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
	    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
	    ig.input.bind(ig.KEY.SPACE, 'shoot');

      ig.maths = new Maths();
      ig.updater = new Updater();
      ig.spawner = new Spawner();
      ig.runner = new Runner();

	    ig.game.loadLevel(LevelA);

      ig.game.player = ig.game.getEntitiesByType(EntityPlayer)[0];

      ig.asteroidSpawner = new AsteroidSpawner();
      ig.collider = new Collider();
      ig.updater.add(ig.asteroidSpawner);
      ig.updater.add(ig.collider);
      ig.updater.add(ig.spawner);
      ig.updater.add(ig.runner);

      this.STATE = {
        INTRO: 0,
        PLAYING: 1,
        OVER: 2
      };

      this.state = this.STATE.INTRO;
	  },

	  update: function() {
		  this.parent();
      if (this.state === this.STATE.PLAYING) {
        ig.updater.update();
        if (this.score() <= 0) {
          this.state = this.STATE.OVER;
        }
      } else if (this.state === this.STATE.INTRO || this.state === this.STATE.OVER) {
        if(ig.input.state("shoot")) {
          var asteroids = ig.game.getEntitiesByType(EntityAsteroid);
          for (var i = 0; i < asteroids.length; i++) {
            asteroids[i].kill();
          }

          ig.game.player.kill(0);
          ig.asteroidSpawner.spawnInitial();
          this.state = this.STATE.PLAYING;
        }
      }
	  },

    maxScore: 50,
	  draw: function() {
		  this.parent();
      if (this.state === this.STATE.PLAYING) {
        var scoreOutput = " ";
        for (var i = 0; i < this.maxScore; i++) {
          if (i > this.score()) {
            if (i % 2 === 0) {
              scoreOutput += " ";
            } else {
              scoreOutput = " " + scoreOutput;
            }
          } else {
            scoreOutput += ".";
          }
        }

        this.font.draw(scoreOutput,
                       ig.system.width / 2, ig.system.height / 2 - 12, ig.Font.ALIGN.CENTER);
      } else {
        this.font.draw("LEFT RIGHT SPACE",
                       ig.system.width / 2, ig.system.height / 2 - 5, ig.Font.ALIGN.CENTER);

      }
	  },

    score: function() {
      return this.maxScore - EntityAsteroid.count();
    },

    startClip: function() {
      var ctx = ig.system.context;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ig.system.width / 2, ig.system.height / 2,
              ig.system.width / 2 , 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
    },

    endClip: function() {
      ig.system.context.restore();
    },
  });

  ig.main( '#canvas', MyGame, 120, 600, 600, 1 );
});
