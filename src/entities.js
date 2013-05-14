;(function(exports) {
  function Entities() {
    this._entities = [];
  };

  Entities.prototype = {
    all: function(clazz) {
      if (clazz === undefined) {
        return this._entities;
      } else {
        var entities = [];
        for (var i = 0; i < this._entities.length; i++) {
          if (this._entities[i] instanceof clazz) {
            entities.push(this._entities[i]);
          }
        }

        return entities;
      }
    },

    create: function(clazz, settings, callback) {
      Coquette.get().runner.add(this, function(entities) {
        var entity = new clazz(Coquette.get().game, settings || {});
        Coquette.get().updater.add(entity);
        entities._entities.push(entity);
        if (callback !== undefined) {
          callback(entity);
        }
      });
    },

    destroy: function(entity, callback) {
      Coquette.get().runner.add(this, function(entities) {
        Coquette.get().updater.remove(entity);
        entity._killed = true;
        Coquette.get().updater.remove(entity);
        for(var i = 0; i < entities._entities.length; i++) {
          if(entities._entities[i] === entity) {
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

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);
