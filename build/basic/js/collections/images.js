(function () {
  var Collection = require('./base')
    , Image = require('../models/image')
    , _ = require('lodash')
    , Images = Collection.extend({
        name:'image'
      , url: function () {
          return this.app.config.baseUrl+'/images.json'+(this.app.bootstrap.userId ? '?userId=' + this.app.bootstrap.userId : '');
        }
      , initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};

          // FIXME: This awful situation is because `this` inside
          // the model function refers to a model, not the collection
          this.model = function(attrs, options) {
            var p = opts.app.db.createModel('image');
            return opts.app.db.createModel('image', p.parse(attrs));
          };
        }
      });

  module.exports = Images;
}());
