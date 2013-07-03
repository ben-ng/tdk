(function () {
  var Collection = require('./base')
    , Image = require('../models/image.js')
    , Video = require('../models/video.js')
    , _ = require('lodash')
    , UnprocessedUploads = Collection.extend({
        name:'media',
        url: function () { return this.app.config.baseUrl+'/unprocessed.json'; },
        model: function(attrs, options) {
          if (attrs.type === 'image') {
            return this.app.db.createModel('image').set(attrs);
          } else {
            return this.app.db.createModel('video').set(attrs);
          }
        },
        parse: function(data, options) {
          return _.isEmpty(data.media) ? [] : data.media;
        }
      });
  
  module.exports = UnprocessedUploads;
}());