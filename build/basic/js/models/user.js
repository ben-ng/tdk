/*
The user model is a special case. You authenticate, log out, and create test users
by setting specific values and saving the model.

//Saving this model will attempt to log you in as that user
var user = db.createModel('user').set({username:'test',password:'test'});

//Saving this model will log you out
var user = db.createModel('user').set({id:'logout'});

//Saving this model will create a new user and log you in automatically
//obviously, only works on staging and development endpoints
var user = db.createModel('user').set({id:'test'});

*/
(function () {
  var Model = require('./base')
    , _ = require('lodash')
    , Customization = require('./customization')
    , User = Model.extend({
        name:'user'
      , url: function () {
          return this.app.config.baseUrl+'/users/auth.json';
        }
      , parse: function(data, options) {
          var dataCopy = _.clone(data);

          try {
            dataCopy = dataCopy.user;

            dataCopy.customization =  (new Customization({},{app:this.app})).parse({customization: dataCopy.customization});

            data = dataCopy;
          }
          catch(e) {
            data = {
              error: data.error
            };
          }

          return data;
        }
      , defaults: {
          username:'',
          password:'',
          token:false,
          policy:'',
          signature:'',
          path:'',
          customization:{},
          error:null
        }
      });

  module.exports = User;
}());