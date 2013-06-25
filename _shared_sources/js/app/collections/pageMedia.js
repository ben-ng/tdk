(function () {
  var Collection = require('./base')
    , PageMedia = Collection.extend({
        name:'media',
        initialize: function(models, opts) {
          this.app = opts.app || {};
          this.page = opts.page || null;
          
          this.models = models;
        },
        url: function() {
          return TK.baseURL+'/pages/'+this.page.attributes.id+'/media.json'
        },
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
  
  module.exports = PageMedia;
}());