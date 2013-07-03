(function () {
  var Collection = require('./base')
    , PageMedia = Collection.extend({
        name:'media',
        initialize: function(models, opts) {
          this.app = opts.app || {};
          
          this.models = models;
        },
        url: function() {
          if(this.attributes) {
            return this.app.config.baseURL+'/pages/'+this.attributes.pageId+'/media.json'
          }
          else {
            return this.app.config.baseURL+'/pages/undefined/media.json'
          }
        },
        model: function(attrs, options) {
          if (attrs.type === 'image') {
            return this.app.db.loadModel('image').set(attrs);
          } else {
            return this.app.db.loadModel('video').set(attrs);
          }
        },
        parse: function(data, options) {
          return _.isEmpty(data.media) ? [] : data.media;
        }
      });
  
  module.exports = PageMedia;
}());