(function () {
  var Collection = require('./base')
    , Image = require('../models/image.js')
    , Video = require('../models/video.js')
    , _ = require('lodash')
    , UnprocessedUploads = Collection.extend({
        name:'media'
      , url: function () { return this.app.config.baseUrl+'/unprocessed.json'; }
      , initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};

          // FIXME: This awful situation is because `this` inside
          // the model function refers to a model, not the collection
          this.model = function(attrs, options) {
            if (attrs.type === 'image') {
              return opts.app.db.createModel('image').set(attrs);
            } else {
              return opts.app.db.createModel('video').set(attrs);
            }
          };
        }
      });

  module.exports = UnprocessedUploads;
}());