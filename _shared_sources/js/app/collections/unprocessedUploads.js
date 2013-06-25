Website.Collections.UnprocessedUploads = BaseCollection.extend({
  name:'media',
  url: TK.baseURL+'/unprocessed.json',
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