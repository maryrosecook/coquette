// Produces the minified version.

var packer = require( 'node.packer' ),
    path   = __dirname + '/../src/';

packer({
  log : true,
  input : [
    path + 'coquette.js',
    path + 'collider.js',
    path + 'inputter.js',
    path + 'runner.js',
    path + 'updater.js',
    path + 'renderer.js',
    path + 'entities.js'
  ],
  minify: true,
  output : path + 'coquette-min.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});
