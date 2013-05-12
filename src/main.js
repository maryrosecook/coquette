;(function(exports) {
  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    coquette = this;
    this.renderer = new Coquette.Renderer(canvasId, width, height, backgroundColor);
    this.inputter = new Coquette.Inputter(canvasId, autoFocus);
    this.updater = new Coquette.Updater();
    this.entities = new Coquette.Entities();
    this.runner = new Coquette.Runner();
    this.collider = new Coquette.Collider();

    this.updater.add(this.collider);
    this.updater.add(this.runner);
    this.updater.add(this.renderer);
    this.updater.add(game);
    this.game = game;
  };

  var coquette;
  Coquette.get = function() {
    return coquette;
  };

  exports.Coquette = Coquette;
})(this);
