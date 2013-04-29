ig.module(
  'game.entities.bullet'
).requires(
  'impact.entity'
).defines(function() {
  EntityBullet = ig.Entity.extend({
	  size: {x: 2, y: 2},
    speed:1000,
    zIndex: 1,

	  animSheet: new ig.AnimationSheet('media/bullet.gif', 2, 2),

	  init: function(x, y, settings) {
	    this.parent( x, y, settings );
      this.owner = settings.owner;

	    this.addAnim("main", 1, [0]);
      this.currentAnim = this.anims["main"];

      this.vel = settings.vector;
    },

    collision: function(other) {
      if (other instanceof EntityAsteroid) {
        this.kill();
      }
    }
  });
});
