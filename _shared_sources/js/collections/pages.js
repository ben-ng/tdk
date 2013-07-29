(function () {
  var Collection = require('./base')
    , Page = require('../models/page')
    , _ = require('lodash')
    , Pages = Collection.extend({
        name:'page'
      , url: function () {
          return this.app.config.baseUrl+'/pages.json'+(this.app.bootstrap.userId ? '?userId=' + this.app.bootstrap.userId : '');
        }
      , initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};

          // FIXME: This awful situation is because `this` inside
          // the model function refers to a model, not the collection
          this.model = function(attrs, options) {
            var p = opts.app.db.createModel('page');
            return opts.app.db.createModel('page', p.parse(attrs));
          };
        }
        // Sort by page priority, lowest first
      , comparator: function (page) {
          return page.get('priority');
        }
      });

  module.exports = Pages;
}());
