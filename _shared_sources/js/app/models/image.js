(function () {
  var Media = require('./media')
    , Image = Media.extend({
        name:'image'
      , urlRoot:TK.baseURL+'/images'
      });
  
  module.exports = Image;
}());