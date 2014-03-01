;(function(exports) {
  var Vec = Box2D.Common.Math.b2Vec2;

  var Physics = exports.Physics = function (game, gravity) {
    this.game = game;
		this.world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(gravity.x, gravity.y),
                                            true);
    setupContactListener(this.world);
    this.debugDrawer = new DebugDrawer(game.c.renderer.getCtx(), this.world);
    this.bodies = [];
  };

  Physics.prototype = {
    debug: false,
    update: function(delta) {
      this.world.Step(delta, WORLD_VELOCITY_ITERATIONS, WORLD_POSITION_ITERATIONS);
		  this.world.ClearForces();
    },

    draw: function() {
      if (this.debug === true) {
        this.debugDrawer.draw();
      }
    },

    createSingleShapeBody: function(entity, settings) {
      return this.createMultiShapeBody(entity, [
        this.createFixture(settings.shape, settings)
      ], settings);
    },

    createMultiShapeBody: function(entity, shapes, settings) {
      var body = makeBody(this.world, entity, shapes, settings);

      var physics = this;
      body.remake = function(settingsUpdates) {
        utils.mixin(settingsUpdates, settings);
        utils.mixin({ vec: { x: body.entity.vec.x, y: body.entity.vec.y }}, settings);
        physics.destroyBody(body)
        return physics.createMultiShapeBody(entity, shapes, settings);
      };

      this.bodies.push(body);
      return body;
    },

    createFixture: function(name, settings) {
      settings.offset = settings.offset || { x: 0, y: 0 };
		  var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
		  fixtureDef.density = settings.density || 0.8;
		  fixtureDef.friction = settings.friction || 0;
		  fixtureDef.restitution = settings.restitution || 0.5;
		  fixtureDef.shape = shapes[name].create(settings.size, settings.offset);
      return fixtureDef;
    },

    destroyBody: function(body) {
      for (var i = 0; i < this.bodies.length; i++) {
        if (body === this.bodies[i]) {
          this.bodies.splice(i, 1);
          var self = this;
          this.game.c.runner.add(undefined, function() {
            self.world.DestroyBody(body);
          });
          return;
        }
      }
    },

    createRevoluteJoint: function(entity1, entity2) {
      var jointPos = new Vec(entity1.center.x * BOX_2D_SCALE,
                             entity1.center.y * BOX_2D_SCALE);
      var objPos = new Vec(entity2.center.x * BOX_2D_SCALE,
                           entity2.center.y * BOX_2D_SCALE);

      var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
      jointDef.Initialize(entity1.body, entity2.body, jointPos, objPos);
      return this.world.CreateJoint(jointDef);
    },

    destroyJoint: function(joint) {
      this.world.DestroyJoint(joint);
    },

    freeSpace: function(entity) {
      for (var i = 0; i < this.bodies.length; i++) {
        if (this.bodies[i].entity !== entity) {
          if (isIntersecting(entity, this.bodies[i].entity) === true) {
            return false;
          }
        }
      }

      return true;
    },

    Vec: Vec
  };

  var shapes = {
    circle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2CircleShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
		    this.SetRadius(size.x / 2 * BOX_2D_SCALE);
        if (offset !== undefined) {
          this.SetLocalPosition(new Vec(offset.x * BOX_2D_SCALE, offset.y * BOX_2D_SCALE));
        }
      }
    },

    rectangle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2PolygonShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
        offset = offset || { x: 0, y: 0 };
        this.SetAsOrientedBox(size.x / 2 * BOX_2D_SCALE, size.y / 2 * BOX_2D_SCALE,
                              new Vec(offset.x * BOX_2D_SCALE, offset.y * BOX_2D_SCALE));
      }
    },

    triangle: {
      create: function(size, offset) {
        var shape = new Box2D.Collision.Shapes.b2PolygonShape();
        this.setSize.call(shape, size, offset);
        return shape;
      },

      setSize: function(size, offset) {
        offset = offset || { x: 0, y: 0 };
        var shapeSizeScale = size.x * BOX_2D_SCALE;
        var box2dScaledOffset = {
          x: offset.x * BOX_2D_SCALE,
          y: offset.y * BOX_2D_SCALE
        };

        // pointing down
 	      this.SetAsArray([
          new Vec(-shapeSizeScale * 0.5 + box2dScaledOffset.x,
                   shapeSizeScale * 0.5 + box2dScaledOffset.y), // left top
          new Vec( shapeSizeScale * 0.0 + box2dScaledOffset.x,
                  -shapeSizeScale * 0.5 + box2dScaledOffset.y), // bottom middle
          new Vec( shapeSizeScale * 0.5 + box2dScaledOffset.x,
                   shapeSizeScale * 0.5 + box2dScaledOffset.y) // right top
	      ]);
      }
    }
  };

  var setupContactListener = function(world) {
    var contactHandler = function(fixture1, fixture2, contactType) {
      if(fixture1.GetBody().entity !== undefined) {
        if(fixture1.GetBody().entity.collision !== undefined) {
          fixture1.GetBody().entity.collision(fixture2.GetBody().entity, contactType);
        }
      }

      if(fixture2.GetBody().entity !== undefined) {
        if(fixture2.GetBody().entity.collision !== undefined) {
          fixture2.GetBody().entity.collision(fixture1.GetBody().entity, contactType);
        }
      }
    };

    var WorldContactListener = function(){};
    WorldContactListener.prototype = new Box2D.Dynamics.b2ContactListener();
    WorldContactListener.prototype.BeginContact = function(contact) {
      contactHandler(contact.GetFixtureA(), contact.GetFixtureB(), "add");
    };

    WorldContactListener.prototype.EndContact = function(contact) {
      contactHandler(contact.GetFixtureA(), contact.GetFixtureB(), "remove");
    };

    world.SetContactListener(new WorldContactListener());
  };

  var isIntersecting = function(entity1, entity2) {
    return Coquette.Collider.Maths.rectanglesIntersecting(entity1, entity2);
  };

  var makeBody = function(world, entity, shapes, settings) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.bullet = settings.bullet || false;
    bodyDef.fixedRotation = settings.fixedRotation || false;
		bodyDef.position = new Vec(settings.center.x * BOX_2D_SCALE,
			                         settings.center.y * BOX_2D_SCALE);

		var body = world.CreateBody(bodyDef);
    body.entity = entity;

    // mixin handy fns
    utils.mixin(physicalBodyFns, body);

    if (settings.bodyType !== undefined) {
      body.SetType(settings.bodyType);
    }

    // attach fixtures
    for (var i = 0; i < shapes.length; i++) {
		  body.CreateFixture(shapes[i]);
    }

    if (settings.vec !== undefined) {
      body.setLinearVelocity(settings.vec);
    }

    entity.center = body.center();
    entity.vec = body.vec();
    entity.size = { x: settings.size.x, y: settings.size.y };
    entity.shape = settings.shape;

    return body;
  };

  var BOX_2D_SCALE = 0.1;
  var WORLD_VELOCITY_ITERATIONS = 6;
  var WORLD_POSITION_ITERATIONS = 6;

  var physicalBodyFns = {
    update: function() {
      this.entity.center = this.center();
      this.entity.vec = this.vec();
      this.entity.angle = this.angle();
    },

    setLinearVelocity: function(v) {
      this.m_linearVelocity.x = v.x;
      this.m_linearVelocity.y = v.y;
    },

    center: function() {
		  return {
			  x: this.GetPosition().x / BOX_2D_SCALE,
			  y: this.GetPosition().y / BOX_2D_SCALE
		  };
    },

    push: function(vec, limit) {
      if (limit === undefined || Maths.magnitude(this.vec()) < limit) {
	      this.ApplyForce(new Vec(vec.x, vec.y), this.GetPosition());
      }
    },

    move: function(newCenter) {
      this.SetPosition({
			  x: newCenter.x * BOX_2D_SCALE,
			  y: newCenter.y * BOX_2D_SCALE
		  });

      this.update();
    },

    rotateTo: function(dAngle) {
      this.SetAngle(Maths.degToRad(dAngle));
    },

    drag: function(ratio) {
	    this.ApplyForce(new Vec(-this.m_linearVelocity.x * ratio,
                              -this.m_linearVelocity.y * ratio),
                      this.GetPosition());
    },

    setSize: function(size) {
      var shape = this.GetFixtureList().GetShape(); // assumes only one shape on entity
      shapes[this.entity.shape].setSize.call(shape, size);
      this.entity.size = Maths.copyPoint(size);
    },

    vec: function() {
      return {
        x: this.m_linearVelocity.x,
        y: this.m_linearVelocity.y
      };
    },

    angle: function() {
      return Maths.radToDeg(this.GetAngle());
    },

    mass: function() {
      return this.GetMass();
    }
  };

  var DebugDrawer = function(ctx, world) {
    this.ctx = ctx;
    this.world = world;
    this.canvas = ctx.canvas;
		this.drawer = new Box2D.Dynamics.b2DebugDraw();
		this.drawer.SetSprite(this);
		this.drawer.SetDrawScale(1 / BOX_2D_SCALE);
		this.drawer.SetFillAlpha(0.5);
		this.drawer.SetLineThickness(1.0);
		this.drawer.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit |
                         Box2D.Dynamics.b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.drawer);
  };

  DebugDrawer.prototype = {
	  draw: function() {
		  this.world.DrawDebugData();
	  },

	  clearRect: function() {},

	  beginPath: function() {
		  this.ctx.lineWidth = this.strokeWidth;
		  this.ctx.fillStyle = this.fillStyle;
		  this.ctx.strokeStyle = this.strokeSyle;
		  this.ctx.beginPath();
	  },

	  arc: function(x, y, radius, startAngle, endAngle, counterClockwise) {
		  this.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
	  },

	  closePath: function() {
		  this.ctx.closePath();
	  },

	  fill: function() {
		  this.ctx.fillStyle = this.fillStyle;
		  this.ctx.fill();
	  },

	  stroke: function() {
		  this.ctx.stroke();
	  },

	  moveTo: function(x, y) {
		  this.ctx.moveTo(x, y);
	  },

	  lineTo: function(x, y) {
		  this.ctx.lineTo(x, y);
		  this.ctx.stroke();
	  }
  };

  var isOpposite = function(a, b) {
    return (a <= 0 && b > 0) || (a >= 0 && b < 0);
  };
})(this);
