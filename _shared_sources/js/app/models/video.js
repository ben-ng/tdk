(function () {
  var Media = require('./media')
    , Video = Media.extend({
        name:'video'
      , urlRoot:function () {
        return this.app.config.baseUrl + '/videos';
      }
      });
  
  module.exports = Video;
}());