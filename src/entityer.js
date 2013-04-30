;(function() {
  function Entityer() {
    this.jobs = [];
    this.entities = [];
  };

  Entityer.prototype = {
    update: function() {
      while(this.jobs.length > 0) {
        this.jobs.pop()();
      }
    },

    all: function(clazz) {
      var entities = [];
      for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i] instanceof clazz) {
          entities.push(this.entities[i]);
        }
      }

      return entities;
    },

    add: function(clazz, settings) {
      var self = this;
      this.jobs.push(function() {
	      var entity = new clazz(settings);
        game.updater.add(entity);
        self.entities.push(entity);
      });
    },

    remove: function(entity) {
      var self = this;
      this.jobs.push(function() {
        game.updater.remove(entity);
        entity._killed = true;
        game.updater.remove(entity);
        for(var i = 0; i < self.entities.length; i++) {
          if(self.entities[i] === entity) {
            self.entities.splice(i, 1);
            break;
          }
        }
      });
    }
  };

  this.Entityer = Entityer;
}).call(this);
