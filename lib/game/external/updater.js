;(function() {
  function Updater() {
    this.updatees = [];
  };

  Updater.prototype = {
    update: function() {
      for(var i = 0; i < this.updatees.length; i++) {
        this.updatees[i].update();
      }
    },

    add: function(updatee) {
      this.updatees.push(updatee);
    },

    remove: function(updatee) {
      for(var i = 0; i < this.updatees.length; i++) {
        if(this.updatees[i] === updatee) {
          this.updatees.splice(i, 1);
          break;
        }
      }
    }
  };

  this.Updater = Updater;
}).call(this);
