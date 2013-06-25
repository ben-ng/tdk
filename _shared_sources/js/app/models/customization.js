(function () {
  var Model = require('./base')
    , Customization = Model.extend({
        name:'customization'
      , urlRoot:TK.baseURL+'/Customizations/'
      , methodUrl: function(method) {
          if(method == "delete"){
            return this.urlRoot + this.attributes.id+"/destroy.json";
          }
          else if(method == "update"){
            return this.urlRoot + this.attributes.id+"/update.json";
          }
          else if(method == "read"){
            return this.urlRoot + this.attributes.id+".json";
          }
          else if(method == "create"){
            return this.urlRoot + "/create.json";
          } 
          else if(method == "auth"){
            return this.urlRoot + "/auth.json";
          } 
          return false;
        }
      , parse: function(data, options) {
          this.attributes = data.Customization;
        }
      });
  
  module.exports = Customization;
}());