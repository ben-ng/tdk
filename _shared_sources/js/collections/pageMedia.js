(function () {
  var Collection = require('./base')
    , _ = require('lodash')
    , PageMedia = Collection.extend({
        name:'media'
      , initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};
          this.pageId = opts.pageId || null;

          // FIXME: This awful situation is because `this` inside
          // the model function refers to a model, not the collection
          this.model = function(attrs, options) {
            if (attrs.type === 'image') {
              return opts.app.db.createModel('image', attrs);
            } else {
              return opts.app.db.createModel('video', attrs);
            }
          };
        }
      , url: function() {
          return this.app.config.baseUrl+'/pages/'+this.pageId+'/media.json'
        }
      });

  module.exports = PageMedia;
}());