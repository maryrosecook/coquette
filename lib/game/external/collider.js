;(function(exports) {
  var Collider = function() {

  };

  Collider.prototype = {
    collideRecords: [],

    update: function() {
      for (var i = 0, len = ig.game.entities.length; i < len; i++) {
        for (var j = i; j < len; j++) {
          if (ig.game.entities[i] !== ig.game.entities[j]) {
            if (ig.maths.circlesIntersecting(ig.game.entities[i], ig.game.entities[j])) {
              this.addNewCollision(ig.game.entities[i], ig.game.entities[j]);
            } else {
              this.removeOldCollision(ig.game.entities[i], ig.game.entities[j]);
            }
          }
        }
      }
    },

    addNewCollision: function(entity1, entity2) {
      if (this.getCollideRecord(entity1, entity2) === undefined) {
        this.collideRecords.push([entity1, entity2]);
        if (entity1.collision !== undefined) {
          entity1.collision(entity2);
        }

        if (entity2.collision !== undefined) {
          entity2.collision(entity1);
        }
      }
    },

    removeEntity: function(entity) {
      this.removeOldCollision(entity);
    },

    // if passed entities recorded as colliding in history record, remove that record
    removeOldCollision: function(entity1, entity2) {
      var recordId = this.getCollideRecord(entity1, entity2);
      if (recordId !== undefined) {
        var record = this.collideRecords[recordId];
        if (record[0].uncollision !== undefined) {
          record[0].uncollision(record[1]);
        }

        if (record[1].uncollision !== undefined) {
          record[1].uncollision(record[0]);
        }

        this.collideRecords.splice(recordId, 1);
      }
    },

    getCollideRecord: function(entity1, entity2) {
      for (var i = 0, len = this.collideRecords.length; i < len; i++) {
        // looking for coll where one entity appears
        if (entity2 === undefined &&
            (this.collideRecords[i][0] === entity1 ||
             this.collideRecords[i][1] === entity1)) {
          return i;
        // looking for coll between two specific entities
        } else if (this.collideRecords[i][0] === entity1 &&
                   this.collideRecords[i][1] === entity2) {
          return i;
        }
      }
    }
  };

  exports.Collider = Collider;
})(this);
