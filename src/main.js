;(function(exports) {
  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    this.renderer = new Coquette.Renderer(this, canvasId, width, height, backgroundColor);
    this.inputter = new Coquette.Inputter(this, canvasId, autoFocus);
    this.updater = new Coquette.Updater(this);
    this.entities = new Coquette.Entities(this);
    this.runner = new Coquette.Runner(this);
    this.collider = new Coquette.Collider(this);

    this.updater.add(this.collider);
    this.updater.add(this.runner);
    this.updater.add(this.renderer);
    this.updater.add(game);
  };

  exports.Coquette = Coquette;
})(this);
