;(function(exports) {
  function Entities(coquette, game) {
    this.c = coquette;
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
        return this._entities.slice(); // return shallow copy of array
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

    create: function(Constructor, settings) {
      var entity = new Constructor(this.game, settings || {});
      this.c.collider.createEntity(entity);
      this._entities.push(entity);
      return entity;
    },

    destroy: function(entity) {
      for(var i = 0; i < this._entities.length; i++) {
        if(this._entities[i] === entity) {
          this.c.collider.destroyEntity(entity);
          this._entities.splice(i, 1);
          break;
        }
      }
    }
  };

  exports.Entities = Entities;
})(typeof exports === 'undefined' ? this.Coquette : exports);
