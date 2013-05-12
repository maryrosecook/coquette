// Produces the minified version.

var packer = require( 'node.packer' ),
    path   = __dirname + '/../src/';

var input = [
  path + 'main.js',
  path + 'collider.js',
  path + 'inputter.js',
  path + 'runner.js',
  path + 'updater.js',
  path + 'renderer.js',
  path + 'entities.js'
];

packer({
  log: true,
  input: input,
  minify: true,
  output: path + 'coquette-min.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});

packer({
  log: true,
  input: input,
  minify: false,
  output: path + 'coquette.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});
