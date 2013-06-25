(function () {
  var Model = require('./base')
    , User = Media.extend({
        name:'user'
      , url:TK.baseURL+'/users/auth.json'
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