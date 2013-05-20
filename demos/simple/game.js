;(function(exports) {
  var Game = function(canvasId, width, height, autoFocus) {
    this.coq = new Coquette(this, canvasId, width, height, "#000", autoFocus);

    this.coq.entities.create(Person, { pos:{ x:243, y:40 }, color:"#099" }); // paramour
    this.coq.entities.create(Person, { pos:{ x:249, y:110 }, color:"#f07", // player
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

  var Person = function(_, settings) {
    for (var i in settings) {
      this[i] = settings[i];
    }
    this.size = { x:9, y:9 };
    this.draw = function(ctx) {
      ctx.fillStyle = settings.color;
      ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    };
  };

  exports.Game = Game;
})(this);
