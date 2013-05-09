;(function(exports) {
  var coquette;

  var Coquette = function(game, canvasId, width, height, backgroundColor) {
    coquette = this;
    this.renderer = new Coquette.Renderer(canvasId, width, height, backgroundColor);
    this.inputter = new Coquette.Inputter();
    this.updater = new Coquette.Updater();
    this.entities = new Coquette.Entities();
    this.runner = new Coquette.Runner();
    this.collider = new Coquette.Collider();

    this.updater.add(this.collider);
    this.updater.add(this.runner);
    this.updater.addGame(game);
    this.updater.add(this.renderer);
    this.game = game;
  };

  Coquette.get = function() {
    return coquette;
  };

  exports.Coquette = Coquette;
})(this);
