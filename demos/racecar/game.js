;(function(exports) {
  // Written for Ludum Dare #31 (December 2014)

  var WALL_COLOR = "#000";
  var WHEEL_COLOR = "#000";
  var BACKGROUND_COLOR = "#fff";
  var TEXT_COLOR = "#000";
  var COUNTDOWN_COLORS = ["#0f0", "#fc0", "#f00"];

  function Game() {
    this.size = { x: 1000, y: 500 };
    this.c = new Coquette(this, "screen", this.size.x, this.size.y, BACKGROUND_COLOR);

    this.state = "init";
    this.states = {
      "init": ["countingDown"],
      "countingDown": ["racing"],
      "racing": ["raceOver", "countingDown"],
      "raceOver": ["countingDown"]
    };

    this.best = undefined;
    this.restart();

    makeEntities(this.c, Checkpoint, CHECKPOINTS);
    makeEntities(this.c, Wall, WALLS);
    this.c.entities.create(BridgeSurface); // ridiculous bridge
  };

  Game.prototype = {
    update: function() {
      if (this.state === "countingDown") {
        this.countingDown();
      } else if (this.state === "racing") {
        this.racing();
      } else if (this.state === "raceOver") {
        this.raceOver();
      }
    },

    draw: function(ctx) {
      if (this.state === "raceOver") {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(105, 200, 290, 200);

        ctx.fillStyle = COUNTDOWN_COLORS[2];
        ctx.fillRect(610, 100, 285, 200);
      } else {
        ctx.fillStyle = COUNTDOWN_COLORS[this.countdown];
        ctx.fillRect(610, 100, 285, 200);
      }

      ctx.font = "20px Courier";
      ctx.fillStyle = TEXT_COLOR;

      ctx.fillText("BEST " + (this.best === undefined ? "" : formatTime(this.best)), 160, 277);
      ctx.fillText("THIS " + formatTime(this.thisTime), 160, 307);
      ctx.fillText("LAPS " + this.car.lapsToGo(), 160, 337);
    },

    transition: function(nextState) {
      if (this.states[this.state].indexOf(nextState) !== -1) {
        this.state = nextState;
      } else {
        throw "Tried to transition from " + this.state + " to " + nextState;
      }
    },

    countingDown: function() {
      this.thisTime = 0;
      if (this.lastCountdownDecrement + 1000 < new Date().getTime()) {
        this.countdown--;
        this.lastCountdownDecrement = new Date().getTime();
        if (this.countdown === 0) {
          this.transition("racing");
          this.started = new Date().getTime();
        }
      }
    },

    racing: function() {
      this.thisTime = new Date().getTime() - this.started;
      if (this.car.lapsToGo() === 0) {
        this.stopped = new Date().getTime();
        var time = this.stopped - this.started;
        if (this.best === undefined || time < this.best) {
          this.best = time;
        }

        this.transition("raceOver");
      }

      if (this.c.inputter.isPressed(this.c.inputter.R)) {
        this.restart();
      }
    },

    raceOver: function() {
      this.thisTime = this.stopped - this.started;
      if (this.c.inputter.isPressed(this.c.inputter.R)) {
        this.restart();
      }
    },

    restart: function() {
      this.lastCountdownDecrement = new Date().getTime();
      this.countdown = 2;
      this.transition("countingDown");
      this.started = new Date().getTime();
      this.stopped = undefined;

      if (this.car !== undefined) {
        this.car.destroy();
      }

      this.car = this.c.entities.create(Car, {
        center: { x: this.size.x * 0.95, y: this.size.y / 2 - 15 }
      });
    }
  };

  function Checkpoint(game, options) {
    this.game = game;
    this.center = options.center;
    this.size = options.size;
    this.angle = options.angle;
    this.label = options.label || undefined;
    this.color = "#000";
  };

  Checkpoint.prototype = {
    draw: function(ctx) {
      if (this.label === "bridge") {
        ctx.restore(); // doing own rotation of drawing so stop framework doing it
        var endPoints = util.objToLinePoints(this);
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(endPoints[0].x, endPoints[0].y);
        ctx.lineTo(endPoints[1].x, endPoints[1].y);
        ctx.stroke();
        ctx.closePath();
      }
    },

    isHorizontal: function() {
      return this.angle === 90;
    },

    collision: function(other) {
      if (other instanceof Car) {
        var car = other;
        var latestPass = car.passes[car.passes.length - 1];
        if (latestPass !== this &&
            car.center.y < this.center.y) {
          car.passes.push(this);
        } else if (latestPass === this &&
                   car.center.y > this.center.y) {
          car.passes.pop();
        }
      }
    }
  };

  function Wall(game, options) {
    this.game = game;
    this.zindex = 0;
    this.center = options.center;
    this.size = options.size;
    this.label = options.label;
    this.invisible = options.invisible === true || false;
    this.angle = options.angle;
  };

  Wall.prototype = {
    draw: function(ctx) {
      if (!this.invisible) {
        util.fillRect(ctx, this, WALL_COLOR);
      }
    }
  };

  function FrontWheel(game, options) {
    this.game = game;
    this.zindex = 2;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
    this.wheelAngle = 0;
  };

  FrontWheel.prototype = {
    turnRate: 0,
    update: function(delta) {
      if (this.game.state === "countingDown") { return; }

      var TURN_ACCRETION = 0.007 * delta;
      var MAX_WHEEL_ANGLE = 30;
      var WHEEL_RECENTER_RATE = 2;

      if (this.game.c.inputter.isDown(this.game.c.inputter.LEFT_ARROW)) {
        this.turnRate -= TURN_ACCRETION
      } else if (this.game.c.inputter.isDown(this.game.c.inputter.RIGHT_ARROW)) {
        this.turnRate += TURN_ACCRETION;
      } else {
        this.turnRate = 0;
      }

      if (this.turnRate < 0 && this.wheelAngle > -MAX_WHEEL_ANGLE ||
          this.turnRate > 0 && this.wheelAngle < MAX_WHEEL_ANGLE) {
        this.wheelAngle += this.turnRate;
      } else if (this.turnRate === 0) {
        if (Math.abs(this.wheelAngle) < 0.5) {
          this.wheelAngle = 0;
        } else if (this.wheelAngle > 0) {
          this.wheelAngle -= WHEEL_RECENTER_RATE;
        } else if (this.wheelAngle < 0) {
          this.wheelAngle += WHEEL_RECENTER_RATE;
        }
      }

      this.angle = this.car.angle + this.wheelAngle;
    },

    draw: function(ctx) {
      util.fillRect(ctx, this, WHEEL_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function BackWheel(game, options) {
    this.game = game;
    this.zindex = 2;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
  };

  BackWheel.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, WHEEL_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function BridgeSurface(game) {
    this.game = game;
    this.zindex = 3;
  };

  BridgeSurface.prototype = {
    draw: function(ctx) {
      if (this.game.car.label() === "tunnel") {
        util.fillRect(ctx, { center: { x: 450, y: 150 }, size: { x: 90, y: 90 } },
                      BACKGROUND_COLOR);
      }

      util.fillRect(ctx, { center: { x: 400, y: 150 }, size: { x: 10, y: 90 } }, WALL_COLOR);
      util.fillRect(ctx, { center: { x: 500, y: 150 }, size: { x: 10, y: 90 } }, WALL_COLOR);
    }
  };

  function Car(game, options) {
    this.game = game;
    this.zindex = 1;
    this.center = options.center;
    this.color = options.color;
    this.size = { x: 10, y: 24 };
    this.angle = 0;
    this.velocity = { x: 0, y: 0 };
    this.passes = [];

    this.frontLeft = this.game.c.entities.create(FrontWheel, {
      center: { x: this.center.x - this.size.x / 2, y: this.center.y - this.size.y / 2.5 },
      car: this
    });

    this.frontRight = this.game.c.entities.create(FrontWheel, {
      center: { x: this.center.x + this.size.x / 2, y: this.center.y - this.size.y / 2.5 },
      car: this
    });

    this.backLeft = this.game.c.entities.create(BackWheel, {
      center: { x: this.center.x - this.size.x / 2, y: this.center.y + this.size.y / 2.5 },
      car: this
    });

    this.backRight = this.game.c.entities.create(BackWheel, {
      center: { x: this.center.x + this.size.x / 2, y: this.center.y + this.size.y / 2.5 },
      car: this
    });
  };

  function angleDiff(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b)) * util.DEGREES_TO_RADIANS;
  };

  Car.prototype = {
    update: function(delta) {
      if (this.game.state === "countingDown") { return; }

      var ACCELERATION_ACCRETION = 0.002 * delta;
      var MAX_SPEED = 5;

      if (this.frontLeft.wheelAngle !== 0) {
        var turnRadius = this.size.y * 90 / this.frontLeft.wheelAngle;
        var turnCircumference = 2 * Math.PI * turnRadius;
        var rotateProportion = util.magnitude(this.velocity) / turnCircumference;

        var dir;
        if (this.game.c.inputter.isDown(this.game.c.inputter.UP_ARROW)) {
          dir = 1;
        } else if (this.game.c.inputter.isDown(this.game.c.inputter.DOWN_ARROW)) {
          dir = -1;
        } else {
          var velocityAngle = util.vectorToAngle(this.velocity);
          var orientationAngle = util.vectorToAngle(util.angleToVector(this.angle));
          var reversing = Math.abs(angleDiff(velocityAngle, orientationAngle)) > 90;
          dir = reversing ? -1 : 1;
        }

        var rotateAngleDelta = rotateProportion * 360 * dir;
        this.velocity = util.rotate(this.velocity, { x: 0, y: 0 }, rotateAngleDelta);

        this.wheels().concat(this).forEach(function(o) { o.angle += rotateAngleDelta; });
        this.wheels().forEach(function(w) {
          w.center = util.rotate(w.center, this.center, rotateAngleDelta);
        }, this);
      }

      var ratio = MAX_SPEED - util.magnitude(this.velocity);
      if (this.game.c.inputter.isDown(this.game.c.inputter.UP_ARROW)) {
        var headingVector = util.angleToVector(this.angle);
        this.velocity.x += headingVector.x * ACCELERATION_ACCRETION * ratio;
        this.velocity.y += headingVector.y * ACCELERATION_ACCRETION * ratio;
      } else if (this.game.c.inputter.isDown(this.game.c.inputter.DOWN_ARROW)) {
        var headingVector = util.angleToVector(this.angle + 180);
        this.velocity.x += headingVector.x * ACCELERATION_ACCRETION * ratio;
        this.velocity.y += headingVector.y * ACCELERATION_ACCRETION * ratio;
      }

      this.move();

      // friction
      this.velocity = util.multiply(this.velocity, { x: 0.99, y: 0.99 });
    },

    wheels: function() {
      return [this.frontLeft, this.frontRight, this.backLeft, this.backRight];
    },

    lapsToGo: function() {
      return 3 - Math.floor((this.passes.length - 1) / 2);
    },

    label: function() {
      var lastPass = this.passes[this.passes.length - 1];
      if (lastPass !== undefined) {
        return lastPass.label;
      }
    },

    move: function() {
      this.wheels().concat(this).forEach(function(o) {
        o.center.x += this.velocity.x;
        o.center.y += this.velocity.y;
      }, this);
    },

    draw: function(ctx) {
      util.fillRect(ctx, this, "#000");
    },

    collision: function(other) {
      this.handleCollision(this, other);
    },

    handleCollision: function(carPiece, other) {
      if (other instanceof Wall) {
        var car = carPiece.car || carPiece;
        if (other.label === undefined || car.label() !== other.label) {
          var bounceRatio = 0.4;
          var otherNormal = util.bounceLineNormal(car, other);

          function carInWall(car) {
            return [car].concat(car.wheels())
              .filter(function(p) {
                return this.game.c.collider.isIntersecting(p, other)
              }).length > 0
          };

          // get out of wall

          var oldVelocity = this.velocity;
          car.velocity = util.unitVector(otherNormal);
          var i = 0;
          while(carInWall(car)) {
            i++;
            car.move();
            if (i > 100) {
              break;
            }
          }

          car.velocity = oldVelocity;

          // bounce off wall

          var dot = util.dotProduct(car.velocity, otherNormal);
          car.velocity.x -= 2 * dot * otherNormal.x;
          car.velocity.y -= 2 * dot * otherNormal.y;

          car.velocity = util.multiply(car.velocity, { x: bounceRatio, y: bounceRatio });

          var i = 0;
          while (carInWall(car)) {
            i++;
            car.move();
            if (i > 100) {
              break;
            }
          }
        }
      }
    },

    destroy: function() {
      var c = this.game.c;
      c.entities.destroy(this);
      this.wheels().forEach(function(w) { c.entities.destroy(w); });
    }
  };

  var util = {
    RADIANS_TO_DEGREES: Math.PI / 180,
    DEGREES_TO_RADIANS: 180 / Math.PI,

    angleToVector: function(angle) {
      var r = angle * 0.01745;
      return this.unitVector({ x: Math.sin(r), y: -Math.cos(r) });
    },

    objToLinePoints: function(obj) {
      return [
        util.rotate({ x: obj.center.x, y: obj.center.y + obj.size.y / 2 },
                    obj.center,
                    obj.angle),
        util.rotate({ x: obj.center.x, y: obj.center.y - obj.size.y / 2 },
                    obj.center,
                    obj.angle)
      ]
    },

    vectorToAngle: function(v) {
      var unitVec = this.unitVector(v);
      var uncorrectedDeg = Math.atan2(unitVec.x, -unitVec.y) * this.DEGREES_TO_RADIANS;
      var angle = uncorrectedDeg;
      if(uncorrectedDeg < 0) {
        angle = 360 + uncorrectedDeg;
      }

      return angle;
    },

    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    unitVector: function(vector) {
      return {
        x: vector.x / this.magnitude(vector),
        y: vector.y / this.magnitude(vector)
      };
    },

    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    rotate: function(point, pivot, angle) {
      angle *= this.RADIANS_TO_DEGREES;
      return {
        x: (point.x - pivot.x) * Math.cos(angle) -
          (point.y - pivot.y) * Math.sin(angle) +
          pivot.x,
        y: (point.x - pivot.x) * Math.sin(angle) +
          (point.y - pivot.y) * Math.cos(angle) +
          pivot.y
      };
    },

    bounceLineNormal: function(obj, line) {
      var objToClosestPointOnLineVector =
          util.vectorBetween(
            util.pointOnLineClosestToObj(obj, line),
            obj.center);

      return util.unitVector(objToClosestPointOnLineVector);
    },

    pointOnLineClosestToObj: function(obj, line) {
      var endPoints = util.objToLinePoints(line);
      var lineEndPoint1 = endPoints[0]
      var lineEndPoint2 = endPoints[1];

      var lineUnitVector = util.unitVector(util.angleToVector(line.angle));
      var lineEndToObjVector = util.vectorBetween(lineEndPoint1, obj.center);
      var projection = util.dotProduct(lineEndToObjVector, lineUnitVector);

      if (projection <= 0) {
        return lineEndPoint1;
      } else if (projection >= line.len) {
        return lineEndPoint2;
      } else {
        return {
          x: lineEndPoint1.x + lineUnitVector.x * projection,
          y: lineEndPoint1.y + lineUnitVector.y * projection
        };
      }
    },

    vectorBetween: function(startPoint, endPoint) {
      return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
      };
    },

    add: function(v1, v2) {
      return { x: v1.x + v2.x, y: v1.y + v2.y };
    },

    multiply: function(v1, v2) {
      return { x: v1.x * v2.x, y: v1.y * v2.y };
    },

    fillRect: function(ctx, obj, color) {
      ctx.fillStyle = color;
      ctx.fillRect(obj.center.x - obj.size.x / 2,
                   obj.center.y - obj.size.y / 2,
                   obj.size.x,
                   obj.size.y);
    }
  };

  function formatTime(millis) {
    if (millis !== undefined) {
      return (millis / 1000).toFixed(3);
    } else {
      return "";
    }
  };

  function makeEntities(c, Constructor, optionsArray) {
    for (var i = 0; i < optionsArray.length; i++) {
      c.entities.create(Constructor, optionsArray[i]);
    }
  };

  var CHECKPOINTS = [
    { center: { x: 950, y: 240 }, size: { x: 10, y: 100 }, angle: 90, label: "bridge" },
    { center: { x: 55, y: 300 }, size: { x: 10, y: 100 }, angle: 90, label: "tunnel" }
  ];

  var WALLS = [
    { center: { x: 900, y: 200 }, size: { x: 10, y: 210 }, angle: 180 },
    { center: { x: 995, y: 200 }, size: { x: 10, y: 400 }, angle: 180 },
    { center: { x: 700, y: 5 },   size: { x: 10, y: 600 }, angle: 90 },
    { center: { x: 700, y: 100 }, size: { x: 10, y: 410 }, angle: 90 },
    { center: { x: 400, y: 50 },  size: { x: 10, y: 100 }, angle: 0 },
    { center: { x: 400, y: 300 }, size: { x: 10, y: 200 }, angle: 0 },
    { center: { x: 500, y: 350 }, size: { x: 10, y: 310 }, angle: 0 },
    { center: { x: 250, y: 400 }, size: { x: 10, y: 310 }, angle: 270 },
    { center: { x: 5, y: 300 },   size: { x: 10, y: 400 }, angle: 0 },
    { center: { x: 100, y: 300 }, size: { x: 10, y: 200 }, angle: 0 },
    { center: { x: 200, y: 100 }, size: { x: 10, y: 410 }, angle: 90 },
    { center: { x: 250, y: 200 }, size: { x: 10, y: 310 }, angle: 90 },
    { center: { x: 610, y: 200 }, size: { x: 10, y: 210 }, angle: 180 },
    { center: { x: 750, y: 300 }, size: { x: 10, y: 290 }, angle: 90 },
    { center: { x: 750, y: 400 }, size: { x: 10, y: 510 }, angle: 90 },
    { center: { x: 250, y: 495 }, size: { x: 10, y: 500 }, angle: 270 },

    { center: { x: 400, y: 150 }, size: { x: 10, y: 90 }, angle: 0, label: "tunnel",
      invisible: true },
    { center: { x: 500, y: 150 }, size: { x: 10, y: 90 }, angle: 0, label: "tunnel",
      invisible: true },
    { center: { x: 450, y: 100 }, size: { x: 10, y: 90 }, angle: 90, label: "bridge",
      invisible: true },
    { center: { x: 450, y: 200 }, size: { x: 10, y: 90 }, angle: 90, label: "bridge",
      invisible: true }
  ];

  exports.Game = Game;
})(this);
