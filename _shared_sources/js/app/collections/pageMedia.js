(function () {
  var Collection = require('./base')
    , PageMedia = Collection.extend({
        name:'media'
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
      , url: function() {
          if(this.attributes) {
            return this.app.config.baseURL+'/pages/'+this.attributes.pageId+'/media.json'
          }
          else {
            return this.app.config.baseURL+'/pages/undefined/media.json'
          }
        }
      , parse: function(data, options) {
          return _.isEmpty(data.media) ? [] : data.media;
        }
      });
  
  module.exports = PageMedia;
}());