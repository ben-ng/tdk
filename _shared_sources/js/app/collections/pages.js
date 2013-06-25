(function () {
  var Collection = require('./base')
    , Page = require('../models/page')
    , Pages = Collection.extend({
        name:'page',
        url: function () { return this.app.baseURL+'/pages.json'; },
        model: Page,
        parse: function(data, options) {
          return _.isEmpty(data.pages) ? [] : data.pages;
        }
      });
  
  module.exports = Pages;
}());
