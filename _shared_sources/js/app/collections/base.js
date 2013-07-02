(function () {
  var Backbone = require('../helpers/CorsBackbone.js')
    , Collection = Backbone.Collection.extend({
        initialize: function(models, opts) {
          this.set(models);
          this.app = opts.app || {};
        }
      });
  
  module.exports = Collection;
}());