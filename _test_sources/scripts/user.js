(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db;
    
    Q.module("User",{
      setup: function() {
        //Force a log out
        Q.stop();
        
        var auser = db.loadModel('user');
        auser.save({id:'logout'},{
          success: function(model) {
            Q.strictEqual(model.attributes.token, false, 'User token is clear');
          
            var cleanuser = db.loadModel('user');
            cleanuser.fetch({
              success:function(freshuser) {
                Q.strictEqual(freshuser.attributes.token, false, 'User is logged out');
                Q.start();
              },
              error: function(err) {
                Q.ok(false, err);
                Q.start();
              }
            });
          },
          error: function(err) {
            Q.ok(false,err);
            Q.start();
          }
        });
      }
    });
    
    Q.asyncTest("Log In (Wrong Password)", 4, function() {
      var user = db.loadModel('user');
      
      user.set({username:'test',password:'badpass'});
      
      user.save(null,{
        success:function(usermodel) {
          Q.strictEqual(usermodel.attributes.token, false, 'User was not logged in');
          
          var afreshuser = db.loadModel('user');
          afreshuser.fetch({
            success:function(freshmodel) {
              Q.strictEqual(freshmodel.attributes.token, false, 'User is still logged out');
              Q.start();
            },
            error: function(err) {
              Q.ok(false, err);
              Q.start();
            }
          });
        },
        error: function(err) {
          Q.ok(false, err);
          Q.start();
        }
      });
    });
    Q.asyncTest("Log In (Correct Password)", 7, function() {
      var user = db.loadModel('user');
      user.set({username:'test',password:process.env.STAGING_PASS || 'passpass'});
      user.save(null,{
        success:function(usermodel) {
          Q.notEqual(usermodel.attributes.token, false, 'User was logged in');
          Q.notEqual(usermodel.attributes.policy, '', 'User policy is set');
          Q.notEqual(usermodel.attributes.signature, '', 'User signature is set');
          Q.notEqual(usermodel.attributes.path, '', 'User path is set');
          
          var bfreshuser = new db.loadModel('user');
          bfreshuser.fetch({
            success:function(freshmodel) {
              Q.notEqual(freshmodel.attributes.token,false, 'User is logged in');
              Q.start();
            },
            error: function(err) {
              Q.ok(false, err);
              Q.start();
            }
          });
        },
        error: function(err) {
          Q.ok(false, err);
          Q.start();
        }
      });
    });
  };
}());