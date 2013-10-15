this.Coquette = within( "coquette.maryrosecook.com", function() {
  var
    Renderer = this.Renderer,
    Inputter = this.Inputter,
    Entities = this.Entities,
    Runner = this.Runner,
    Collider = this.Collider,
    Ticker = this.Ticker;

  var Coquette = function(game, canvasId, width, height, backgroundColor, autoFocus) {
    var canvas = document.getElementById(canvasId);
    this.renderer = new Renderer(this, game, canvas, width, height, backgroundColor);
    this.inputter = new Inputter(this, canvas, autoFocus);
    this.entities = new Entities(this, game);
    this.runner = new Runner(this);
    this.collider = new Collider(this);

    var self = this;
    this.ticker = new Ticker(this, function(interval) {
      self.collider.update(interval);
      self.runner.update(interval);
      if (game.update !== undefined) {
        game.update(interval);
      }

      self.entities.update(interval)
      self.renderer.update(interval);
      self.inputter.update();
    });
  };

  return Coquette;
});
