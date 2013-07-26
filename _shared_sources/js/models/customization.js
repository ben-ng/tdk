(function () {
  var Model = require('./base')
    , Backbone = require('../helpers/BackboneLoader')
    , Customization = Model.extend({
        name:'customization'
      , urlRoot:function () {
        return this.app.config.baseUrl + '/customizations';
        }
      , sync: function(method, model, options) {
          if(method === 'create' || method === 'update') {
            //For the create method we should stringify the items before sending to the server
            model.set("config",JSON.stringify(model.get("config")));
            model.set("diffs",JSON.stringify(model.get("diffs")));
          }
          Backbone.sync(method, model, options);
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