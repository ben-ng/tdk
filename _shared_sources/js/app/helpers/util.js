module.exports = function (config) {
  var util = {};

  /*
  * Creates a holder.js URL to use as a placeholder thumbnail
  */
  util.placeholderThumbnail = function(halfSize) {
    var w = config.thumbnailDims.width;
    var h = config.thumbnailDims.height;

    if(halfSize) {
      w=Math.round(w/2);
      h=Math.round(h/2);
    }

    return 'http://holder.js/'+w+'x'+h+'/text:No Thumbnail';
  };


  util.isVideo = function(filename) {
    var ext = '.'+filename.split('.').pop().toLowerCase();
    return config.videoExts.indexOf(ext)>=0;
  };

  util.isImage = function(filename) {
    var ext = '.'+filename.split('.').pop().toLowerCase();
    return config.imageExts.indexOf(ext)>=0;
  };

  util.ucfirst = function(str) {
    var s = str.charAt(0).toUpperCase();
    return s + str.substr(1);
  };

  util.uuid = function(length) {
    var possible = "abcdefghijklmnopqrstuvwxyz"
      , length = length || 10
      , id
      , output = [];

    for( i=0; i < length; i++ ) {
      output.push(possible.charAt(Math.floor(Math.random() * possible.length)));
    }

    return output.join('');
  };

  util.mime = function(mime) {
    if(mime === 'video/quicktime') {
      return 'video/mp4';
    }

    return mime;
  };

  return util;
};
