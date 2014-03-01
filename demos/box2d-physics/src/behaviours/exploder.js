;(function() {
  this.exploder = {
    setup: function(owner, eventer, settings) {
      eventer.bind(this, "exploder:" + settings.event, function() {
        game.c.runner.add(undefined, function() { // make sure not in coll det
          for(var i = 0; i < settings.count; i++) {
            owner.game.c.entities.create(Particle, {
              center: { x: owner.center.x, y: owner.center.y },
              color: settings.color,
              density: settings.density || 1,
              maxLife: settings.maxLife,
              dangerous: settings.dangerous || false,
              stroke: settings.stroke,
              bullet: false,
              pusher: function() {
                this.body.push({
                  x: (Math.random() - 0.5) * settings.force,
                  y: (Math.random() - 0.5) * settings.force
                });
              }
            });
          }
        });
      });
    }
  };
}).call(this);
