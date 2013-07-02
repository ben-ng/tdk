(function () {
  var Collection = require('./base')
    , Image = require('../models/image.js')
    , Video = require('../models/video.js')
    , UnprocessedUploads = Collection.extend({
        name:'media',
        url: function () { return this.app.baseURL+'/unprocessed.json'; },
        model: function(attrs, options) {
          if (attrs.type === 'image') {
            return new Image(attrs, options);
          } else {
            return new Video(attrs, options);
          }
        },
        parse: function(data, options) {
          return _.isEmpty(data.media) ? [] : data.media;
        }
      });
  
  module.exports = UnprocessedUploads;
}());