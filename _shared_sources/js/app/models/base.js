(function () {
  var Backbone = require('Backbone')
    , BaseModel = Backbone.Model.extend({
        initialize: function(opts) {
          this.app = opts.app || {};
        }
      , methodUrl: function(method) {
          if(method == "delete"){
            return this.urlRoot + "/" +this.attributes.id+".json";
          }
          else if(method == "update"){
            return this.urlRoot + "/" +this.attributes.id+".json";
          }
          else if(method == "read"){
            return this.urlRoot + "/" +this.attributes.id+".json";
          }
          else if(method == "create"){
            return this.urlRoot + ".json";
          } 
          return false;
        }
        });
  
  module.exports = BaseModel;
}());