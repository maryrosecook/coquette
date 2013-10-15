within("coquette.maryrosecook.com", function() {
  function Entities(coquette, game) {
    this.coquette = coquette;
    this.game = game;
    this._entities = [];
  };

  Entities.prototype = {
    update: function(interval) {
      var entities = this.all();
      for (var i = 0, len = entities.length; i < len; i++) {
        if (entities[i].update !== undefined) {
          entities[i].update(interval);
        }
      }
    },

    all: function(Constructor) {
      if (Constructor === undefined) {
        return this._entities;
      } else {
        var entities = [];
        for (var i = 0; i < this._entities.length; i++) {
          if (this._entities[i] instanceof Constructor) {
            entities.push(this._entities[i]);
          }
        }

        return entities;
      }
    },

    create: function(clazz, settings, callback) {
      var self = this;
      this.coquette.runner.add(this, function(entities) {
        var entity = new clazz(self.game, settings || {});
        entities._entities.push(entity);
        if (callback !== undefined) {
          callback(entity);
        }
      });
    },

    destroy: function(entity, callback) {
      var self = this;
      this.coquette.runner.add(this, function(entities) {
        for(var i = 0; i < entities._entities.length; i++) {
          if(entities._entities[i] === entity) {
            self.coquette.collider.destroyEntity(entity);
            entities._entities.splice(i, 1);
            if (callback !== undefined) {
              callback();
            }
            break;
          }
        }
      });
    }
  };

  this.Entities = Entities;
});

if (typeof exports === 'undefined') {
  this.Coquette.Entities = within("coquette.maryrosecook.com").get("Entities");
} else {
  exports.Entities = within("coquette.maryrosecook.com").get("Entities");
}
