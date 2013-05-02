;(function(exports) {
  function Entities() {
    this.jobs = [];
    this._entities = [];
  };

  Entities.prototype = {
    update: function() {
      while(this.jobs.length > 0) {
        this.jobs.pop()();
      }
    },

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

    create: function(clazz, settings) {
      var self = this;
      this.jobs.push(function() {
	      var entity = new clazz(Coquette.get().game, settings || {});
        Coquette.get().updater.add(entity);
        self._entities.push(entity);
      });
    },

    destroy: function(entity) {
      var self = this;
      this.jobs.push(function() {
        Coquette.get().updater.remove(entity);
        entity._killed = true;
        Coquette.get().updater.remove(entity);
        for(var i = 0; i < self._entities.length; i++) {
          if(self._entities[i] === entity) {
            self._entities.splice(i, 1);
            break;
          }
        }
      });
    }
  };

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);
