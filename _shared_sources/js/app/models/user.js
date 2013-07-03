/*
The user model is a special case. You authenticate, log out, and create test users
by setting specific values and saving the model.

//Saving this model will attempt to log you in as that user
var user = db.loadModel('user').set({username:'test',password:'test'});

//Saving this model will log you out
var user = db.loadModel('user').set({id:'logout'});

//Saving this model will create a new user and log you in automatically
//obviously, only works on staging and development endpoints
var user = db.loadModel('user').set({id:'test'});

*/
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