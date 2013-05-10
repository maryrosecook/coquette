;(function() {
  var Game = function(canvasId, width, height) {
    this.coq = new Coquette(this, canvasId, width, height, "#000");

    this.coq.entities.create(Person, { pos:{ x:68, y:40 }, color:"#0f0" }); // paramour
    this.coq.entities.create(Person, { pos:{ x:74, y:110 }, color:"#f00", // player
      update: function() {
        if (this.game.coq.inputter.state(this.game.coq.inputter.UP_ARROW)) {
          this.pos.y -= 0.4;
        }
      },
      collision: function(other) {
        other.pos.y = this.pos.y; // follow the player
      }
    });
  };

  var Person = function(game, settings) {
    this.game = game;
    for (var i in settings) {
      this[i] = settings[i];
    }
    this.size = { x:9, y:9 };
    this.draw = function() {
      game.coq.renderer.getCtx().fillStyle = settings.color;
      game.coq.renderer.getCtx().fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    };
  };

  window.addEventListener('load', function() {
    new Game("canvas", 150, 150);
  });
})();
