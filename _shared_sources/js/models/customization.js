(function () {
  var Model = require('./base')
    , Customization = Model.extend({
        name:'customization'
      , urlRoot:function () {
        return this.app.config.baseUrl + '/customizations';
        }
      , parse: function(data, options) {
          data = data.customization;
          delete data.customization;
          
          try {
            data.config = JSON.parse(data.config);
          }
          catch(e) {
            data.config = {error:'Could not parse the JSON'};
          }
          
          return data;
        }
      });
  
  module.exports = Customization;
}());