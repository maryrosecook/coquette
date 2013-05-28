var Entities = require('../src/entities').Entities;
var Renderer = require('../src/renderer').Renderer;
var Runner = require('../src/runner').Runner;

var MockCoquette = function() {
  this.entities = new Entities(this);
  this.runner = new Runner(this);
};

var MockCanvas = function() {
  this.style = {};
  this.getContext = function() {
    return {
      fillRect: function() {},
      beginPath: function() {},
      closePath: function() {},
      lineTo: function() {},
      fill: function() {},
      arc: function() {},
      moveTo: function() {}
    }
  };
};

describe('entities', function() {
  describe('zindex', function() {
    var Entity = function(_, settings) {
      for (var i in settings) {
        this[i] = settings[i];
      }
    };

    var coquette;
    beforeEach(function() {
      coquette = new MockCoquette();
    });

    it('should sort entities with zindex vars lowest to highest', function() {
      coquette.entities.create(Entity, { zindex: -1 });
      coquette.entities.create(Entity, { zindex: -20 });
      coquette.entities.create(Entity, { zindex: 0 });
      coquette.entities.create(Entity, { zindex: 21 });
      coquette.entities.create(Entity, { zindex: 9 });

      coquette.runner.update();

      expect(coquette.entities.all()[0].zindex).toEqual(-20);
      expect(coquette.entities.all()[1].zindex).toEqual(-1);
      expect(coquette.entities.all()[2].zindex).toEqual(0);
      expect(coquette.entities.all()[3].zindex).toEqual(9);
      expect(coquette.entities.all()[4].zindex).toEqual(21);


    });

    it('should sort entities w/o zindex as 0', function() {
      coquette.entities.create(Entity, { zindex: -1 });
      coquette.entities.create(Entity);
      coquette.entities.create(Entity, { zindex: 21 });
      coquette.entities.create(Entity);
      coquette.entities.create(Entity, { zindex: 0 });

      coquette.runner.update();

      expect(coquette.entities.all()[0].zindex).toEqual(-1);
      expect(coquette.entities.all()[1].zindex).toEqual(0);
      expect(coquette.entities.all()[2].zindex).toEqual(undefined);
      expect(coquette.entities.all()[3].zindex).toEqual(undefined);
      expect(coquette.entities.all()[4].zindex).toEqual(21);
    });

    it('should draw entities in zindex sort order', function() {
      var callOrder = 0;
      var recordDrawCall = function() {
        this.callOrder = callOrder++;
      };

      coquette.renderer = new Renderer(coquette, {}, new MockCanvas());

      coquette.entities.create(Entity, { zindex: 1, draw:recordDrawCall });
      coquette.entities.create(Entity, { zindex: 0, draw:recordDrawCall });
      coquette.entities.create(Entity, { zindex: -1, draw:recordDrawCall });

      coquette.runner.update();
      coquette.renderer.update();

      expect(coquette.entities.all()[0].callOrder).toEqual(0);
      expect(coquette.entities.all()[1].callOrder).toEqual(1);
      expect(coquette.entities.all()[2].callOrder).toEqual(2);
    });
  });
});
