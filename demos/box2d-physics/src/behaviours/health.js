;(function() {
  this.health = {
    setup: function(owner, eventer, settings) {
      this.health = settings.health;

      return {
        getHealth: function() {
          return this.health;
        },

        setHealth: function(health) {
          return this.health = health;
        },

        getMaxHealth: function() {
          return settings.maxHealth;
        },

	      receiveDamage: function(amount, from) {
          if(this.health > 0) { // health gets decremented multiple times for some weird reason
            var previousHealth = this.health;
		        this.health -= amount;
		        if(this.health <= 0) {
              owner.destroy(from);
		        } else if (this.health > settings.health) { // don't set health above max
              this.health = settings.health;
            }

            if (previousHealth !== this.health) {
              eventer.emit("health:receiveDamage", from);
            }
          }
        }
      }
    }
  }
}).call(this);
