Website.Collections.PageMedia = BaseCollection.extend({
  name:'media',
  initialize: function(models, opts) {
    if(opts && opts.page) {
      this.page = opts.page;
    }
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