(function () {
  var Backbone = require('../helpers/CorsBackbone.js')
    , BaseModel = Backbone.Model.extend({
        initialize: function(attributes, opts) {
          this.set(attributes);
          this.app = opts.app || {};
        }
      , methodUrl: function(method) {
          var root;
          
          if(typeof this.urlRoot === 'function') {
            root = this.urlRoot();
          }
          else if(this.urlRoot) {
            root = this.urlRoot;
          }
          
          if(method == "delete"){
            return root + "/" +this.attributes.id+".json";
          }
          else if(method == "update"){
            return root + "/" +this.attributes.id+".json";
          }
          else if(method == "read"){
            return root + "/" +this.attributes.id+".json";
          }
          else if(method == "create"){
            return root + ".json";
          } 
          return false;
        }
        });
  
  module.exports = BaseModel;
}());