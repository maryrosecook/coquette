// Produces the minified version.

var packer = require( 'node.packer' ),
    path   = __dirname + '/../',
    src    = path + 'src/',
    out    = path;

var input = [
  src + 'main.js',
  src + 'collider.js',
  src + 'inputter.js',
  src + 'runner.js',
  src + 'updater.js',
  src + 'renderer.js',
  src + 'entities.js'
];

packer({
  log: true,
  input: input,
  minify: true,
  output: out + 'coquette-min.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});

packer({
  log: true,
  input: input,
  minify: false,
  output: out + 'coquette.js',
  callback: function ( err, code ){
    err && console.log( err );
  }
});
