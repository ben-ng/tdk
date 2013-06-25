(function () {
  var Model = require('./base')
    , User = Model.extend({
        name:'user'
      , url: function () {
          return this.app.config.baseUrl+'/users/auth.json';
        }
      , parse: function(data, options) {
          data = data.user;
          return data;
        }
      , defaults: {
          username:'',
          password:'',
          token:false,
          policy:'',
          signature:'',
          path:'',
          error:null
        }
      });
  
  module.exports = User;
}());