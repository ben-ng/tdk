Website.Collections.Pages = BaseCollection.extend({
  name:'page',
  url: TK.baseURL+'/pages.json',
  model: Website.Models.Page,
  parse: function(data, options) {
    return _.isEmpty(data.pages) ? [] : data.pages;
  }
});