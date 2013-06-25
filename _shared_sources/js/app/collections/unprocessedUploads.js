(function () {
  var Collection = require('./base')
    , UnprocessedUploads = Collection.extend({
        name:'media',
        url: function () { return this.app.baseURL+'/unprocessed.json'; },
        model: function(attrs, options) {
          if (attrs.type === 'image') {
            return new Website.Models.Image(attrs, options);
          } else {
            return new Website.Models.Video(attrs, options);
          }
        },
        parse: function(data, options) {
          return _.isEmpty(data.media) ? [] : data.media;
        }
      });
  
  module.exports = UnprocessedUploads;
}());