;(function(exports) {
  var coquette;

  var Coquette = function(game, canvasId, width, height) {
    coquette = this;
    this.renderer = new Coquette.Renderer(canvasId, width, height);
    this.inputter = new Coquette.Inputter();
    this.updater = new Coquette.Updater();
    this.entities = new Coquette.Entities();
    this.runner = new Coquette.Runner();
    this.collider = new Coquette.Collider();

    this.updater.add(this.collider);
    this.updater.add(this.entities);
    this.updater.add(this.runner);
    this.updater.addGame(game);
    this.game = game;
  };

  Coquette.get = function() {
    return coquette;
  };

  exports.Coquette = Coquette;
})(this);
