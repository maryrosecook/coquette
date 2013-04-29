/*
This entity passes through all calls to triggeredBy() to its own targets
after a delay of n seconds.

E.g.: Set an EntityDelay as the target of an EntityTrigger and connect the
entities that should be triggered after the delay as targets to the 
EntityDelay.


Keys for Weltmeister:

delay 
	Delay in seconds after which the targets should be triggered.
	default: 1
	
target.1, target.2 ... target.n
	Names of the entities whose triggeredBy() method will be called after 
	the delay.
*/

ig.module(
	'game.entities.delay'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityDelay = ig.Entity.extend({
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(255, 100, 0, 0.7)',
	
	size: {x: 8, y: 8},
	delay: 1,
	delayTimer: null,
	triggerEntity: null,
	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.delayTimer = new ig.Timer();
	},
	
	
	triggeredBy: function( entity, trigger ) {		
		this.fire = true;
		this.delayTimer.set( this.delay );
		this.triggerEntity = entity;
	},
	
	
	update: function(){
		if( this.fire && this.delayTimer.delta() > 0 ) {
			this.fire = false;

			for( var t in this.target ) {
				var ent = ig.game.getEntityByName( this.target[t] );
				if( ent && typeof(ent.triggeredBy) == 'function' ) {
					ent.triggeredBy( this.triggerEntity, this );
				}
			}
		}
	}
});

});