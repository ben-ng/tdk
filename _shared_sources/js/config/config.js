(function () {
  var config = {};

  // APP CONFIG
  if(process.env.CI || process.env.NODE_ENV === 'staging') {
    config.baseUrl = "http://staging.toolkitt.com";
  }
  else if(process.env.NODE_ENV === 'development') {
    config.baseUrl = "http://localdev.toolkitt.com:4000";
  }
  else {
    config.baseUrl = 'http://www.toolkitt.com';
  }

  config.videoExts = ['.mp4', '.m4v', '.f4v', '.webm', '.ogv','.flv','.mov'];
  config.imageExts = ['.gif', '.png', '.jpeg', '.jpg', '.bmp'];
  config.thumbnailDims = {width:340,height:192};
  config.flashMessage = null;
  config.s3prefix = 'https://toolkitt.s3.amazonaws.com/';
  config.thumberUrl = 'http://s3-us-west-1.amazonaws.com/toolkitt/thumber.html';
  config.videoPlayerId = "media_video";
  config.imageViewerId = "media_image";

  config.placeholders = {
    addMedia: {
      full: 'http://toolkitt.s3.amazonaws.com/addmedia.png'
    , half: 'http://toolkitt.s3.amazonaws.com/addmedia-half.png'
    }
  , encoding: {
      full: 'http://toolkitt.s3.amazonaws.com/encoding.gif'
    , half: 'http://toolkitt.s3.amazonaws.com/encoding-half.gif'
    }
  };

  module.exports = config;
}());