(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var _image_user
      , db = App.db;
    
    Q.module("Image", {
      setup: function() {
        if(!_image_user) {
          Q.stop();
          _image_user = db.createModel('user').set({id:'test'});
          _image_user.save(null,{
            success:function() {
              Q.notEqual(_image_user.attributes.token, false);
              Q.start();
            },
            error: function(model, err) {
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
      var image = db.createModel('image');
      Q.ok(image != null);
    });
    Q.asyncTest("Save, Update & Delete", 18, function() {
      var image = db.createModel('image').set({
        name:'Test Image',
        fpkey:'baz',
        mimeType:'image/png',
        originalFilesize:9000,
        userId:_image_user.id,
        attribs:[{author:'Tom',year:1991}],
        status:0,
        debug:true
      });
      image.save(null,{
        success:function() {
          Q.equal(image.attributes.errors, null, "Save errors: "+JSON.stringify(image.attributes.errors));
          Q.strictEqual(image.attributes.name, "Test Image");
          Q.strictEqual(image.attributes.fpkey, "baz");
          Q.strictEqual(image.attributes.mimeType, "image/png");
          Q.strictEqual(image.attributes.originalFilesize, 9000);
          Q.strictEqual(image.attributes.userId, _image_user.get("id"));
          Q.deepEqual(image.attributes.attribs, [{author:'Tom',year:1991}]);
          Q.strictEqual(image.attributes.status, 0);
          
          //Perform an edit
          image.set("name","Changed Test Image");
          image.set("debug",true);
          
          image.save(null,{
            success:function() {
              Q.equal(image.attributes.errors, null, "Save errors: "+JSON.stringify(image.attributes.errors));
              Q.strictEqual(image.attributes.name, "Changed Test Image","Changed image name correctly");
              Q.strictEqual(image.attributes.fpkey, "baz");
              Q.strictEqual(image.attributes.mimeType, "image/png");
              Q.strictEqual(image.attributes.originalFilesize, 9000);
              Q.strictEqual(image.attributes.userId, _image_user.get("id"));
              Q.deepEqual(image.attributes.attribs, [{author:'Tom',year:1991}]);
              Q.strictEqual(image.attributes.status, 0);
              
              //Destroy the image
              image.destroy({
                success:function(model,resp) {
                  Q.ok(true);
                  Q.start();
                },
                error: function(model, err) {
                  Q.ok(false, err);
                  Q.start();
                }
              });
            },
            error: function(model, err) {
              Q.ok(false, err);
              Q.start();
            }
          });
        },
        error: function(model, err) {
          Q.ok(false, JSON.stringify(err));
          Q.start();
        }
      });
    });
  };
}());
