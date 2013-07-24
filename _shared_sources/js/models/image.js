(function () {
  var Media = require('./media')
    , Image = Media.extend({
        name:'image'
      , urlRoot:function () {
        return this.app.config.baseUrl + '/images';
      }
      });
  
  module.exports = Image;
}());