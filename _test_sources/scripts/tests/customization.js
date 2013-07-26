(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db
      , _customization_user;

    Q.module("Customization", {
      setup: function() {
        if(!_customization_user) {
          Q.stop();
          _customization_user = db.createModel('user').set({id:'test'});
          _customization_user.save(null,{
            success:function() {
              Q.notEqual(_customization_user.attributes.token, false);
              Q.start();
            },
            error: function(err) {
              Q.ok(false, err);
              Q.start();
            }
          });
        }
        else {
          //Dummy assert
          Q.ok(true);
        }
      }
    });
    Q.test("Initialize", 2, function() {
      var customization = db.createModel('customization');
      Q.ok(customization != null);
    });
    Q.asyncTest("Save, Update & Delete", 6, function() {
      var customization = db.createModel('customization');

      customization.set({
        themeId:'nosuchtheme'
      , userId:_customization_user.get("id")
      , config:{rush:2112}
      , diffs:['turkey', 'gravy']
      , outdated:false
      , rendered:(new Date())
      });

      customization.save(null,{
        success:function() {
          Q.ok(customization.attributes.errors == null, "Save errors: "+JSON.stringify(customization.attributes.errors));

          //Perform an edit
          customization.set("config",{rush:'Tom Sawyer'});
          customization.set("diffs",['chicken', 'gravy']);

          customization.save(null,{
            success:function() {

              Q.ok(customization.attributes.errors == null, "Save errors: "
                + JSON.stringify(customization.attributes.errors));

              Q.deepEqual(customization.attributes.config
                , {rush:'Tom Sawyer'}, "Changed config correctly");
              Q.deepEqual(customization.attributes.diffs
                , ['chicken', 'gravy'], "Changed diffs correctly");

              //Destroy the customization
              customization.destroy({
                success:function(model,resp) {
                  Q.ok(true);
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
        },
        error: function(err) {
          Q.ok(false, err);
          Q.start();
        }
      });
    });
  };
}());