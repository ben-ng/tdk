(function () {
  var Media = require('./media')
    , Video = Media.extend({
        name:'video'
      , urlRoot:TK.baseURL+'/videos'
      });
  
  module.exports = Video;
}());