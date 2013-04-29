;(function(exports) {
  var AsteroidSpawner = function() {
  };

  AsteroidSpawner.prototype = {
    lastSpawn: 0,
    update: function() {
      if(ig.maths.timePassed(this.lastSpawn, 3000)) {
        ig.spawner.add(EntityAsteroid, { pos: EntityAsteroid.getRandomPos() });
        this.lastSpawn = new Date().getTime();
      }
    },

    spawnInitial: function() {
      for (var i = 0; i < 2; i++) {
        ig.spawner.add(EntityAsteroid, {
          pos: {
            x: Math.random() * ig.system.width,
            y: Math.random() * ig.system.height
          }
        });
      }
    }
  };

  exports.AsteroidSpawner = AsteroidSpawner;
})(this);
