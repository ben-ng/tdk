(function () {
  var Collection = require('./base')
    , Video = require('../models/video')
    , _ = require('lodash')
    , Videos = Collection.extend({
        name:'video'
      , url: function () {
          return this.app.config.baseUrl+'/videos.json'+(this.app.bootstrap.userId ? '?userId=' + this.app.bootstrap.userId : '');
        }
      , initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};

          // FIXME: This awful situation is because `this` inside
          // the model function refers to a model, not the collection
          this.model = function(attrs, options) {
            var p = opts.app.db.createModel('video');
            return opts.app.db.createModel('video', p.parse(attrs));
          };
        }
      });

  module.exports = Videos;
}());
