;(function(exports) {
  // augments HTML5 image obj

  exports.images = {};

  var createImage = function(url, size, callback) {
    var image = new Image();
    image.onload = callback;
    image.src = url;
    image.size = { x: size.x, y: size.y };
    return image;
  };

  exports.images.load = function(imagesData, callback) {
    var images = {};
    var imagesLoaded = 0;
    var imagesToLoad = 0;
    for (var i in imagesData) {
      imagesToLoad++;
      images[i] = createImage(imagesData[i].url,
                              imagesData[i].size,
                              function() {
                                if (++imagesLoaded === imagesToLoad) {
                                  callback(images);
                                }
                              });
    }

    if (imagesToLoad === 0) { // no images to load
      callback(images);
    }
  };


  Image.prototype.draw = function(ctx) {
    ctx.drawImage(this,
                  this.center.x - this.size.x / 2,
                  this.center.y - this.size.y / 2);
  };
})(this);
