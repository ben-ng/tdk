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
    config.baseUrl = 'http://toolkitt.com';
  }

  config.videoExts = ['.mp4', '.m4v', '.f4v', '.webm', '.ogv','.flv','.mov'];
  config.imageExts = ['.gif', '.png', '.jpeg', '.jpg', '.bmp'];
  config.thumbnailDims = {width:340,height:192};
  config.flashMessage = null;
  config.s3prefix = 'https://toolkitt.s3.amazonaws.com/';
  config.thumberUrl = 'https://toolkitt.s3.amazonaws.com/thumber.html';
  config.videoPlayerId = "media_video";
  config.imageViewerId = "media_image";

  module.exports = config;
}());