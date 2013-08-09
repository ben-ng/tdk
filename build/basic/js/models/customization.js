(function () {
  var Model = require('./base')
    , _ = require('lodash')
    , Backbone = require('../helpers/BackboneLoader')
    , Customization = Model.extend({
        name:'customization'
      , urlRoot: function () {
        return this.app.config.baseUrl + '/customizations';
        }
      , toJSON: function () {
          incoming = _.clone(this.attributes);

          if(incoming.config) {
            incoming.config = JSON.stringify(incoming.config);
          }
          if(incoming.diffs) {
            incoming.diffs = JSON.stringify(incoming.diffs);
          }

          return incoming;
        }
      , parse: function(data, options) {
          data = data.customization;
          delete data.customization;

          try {
            data.config = JSON.parse(data.config);
            data.diffs = JSON.parse(data.diffs);
          }
          catch(e) {
            data.config = {};
            data.diffs = {}
          }

          return data;
        }
      });

  module.exports = Customization;
}());