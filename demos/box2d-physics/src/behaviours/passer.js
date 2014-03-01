;(function() {
  this.passer = {
    setup: function(owner, eventer, settings) {
      eventer.bind(this, settings.from, function(data) {
        eventer.emit(settings.to, data);
      });
    }
  }
}).call(this);
