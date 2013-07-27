(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db
      , _image_user;

    Q.module("Images", {
      setup: function() {
        if(!_image_user) {
          Q.stop();
          _image_user = db.createModel('user').set({id:'test'});
          _image_user.save(null,{
            success:function() {
              Q.notEqual(_image_user.attributes.token, false);
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
      var images = db.createCollection('images');
      Q.ok(images != null);
    });
    Q.asyncTest("Fetch: zero", 2, function() {
      var images = db.createCollection('images');
      images.fetch({
        success:function(collection, response, options) {
          Q.strictEqual(collection.length, 0, "Collection should be initially empty");
          Q.start();
        },
        error:function(collection, response, options) {
          Q.ok(false, "Failed to perform fetch");
          Q.start();
        }
      });
    });
    Q.asyncTest("Fetch: one", 4, function() {
      var images = db.createCollection('images');
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

          images.fetch({
            success:function(collection, response, options) {
              Q.strictEqual(collection.length, 1, "Collection should have one image");
              //Destroy the image
              image.destroy({
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
            error:function(collection, response, options) {
              Q.ok(false, "Failed to perform fetch");
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
    Q.asyncTest("Fetch: two", 6, function() {
      var images = db.createCollection('images');
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
      var image2 = db.createModel('image').set({
        name:'Test Image 2',
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

          image2.save(null,{
            success:function() {
              Q.equal(image2.attributes.errors, null, "Save errors: "+JSON.stringify(image2.attributes.errors));

              images.fetch({
                success:function(collection, response, options) {
                  Q.strictEqual(collection.length, 2, "Collection should have two images");
                  //Destroy the image
                  image.destroy({
                    success:function(model,resp) {
                      Q.ok(true);
                      //Destroy the image
                      image2.destroy({
                        success:function(model,resp) {
                          Q.ok(true);
                          Q.start();
                        },
                        error: function(model,err) {
                          Q.ok(false, err);
                          Q.start();
                        }
                      });
                    },
                    error: function(model,err) {
                      Q.ok(false, err);
                      Q.start();
                    }
                  });
                },
                error:function(model,err) {
                  Q.ok(false, err);
                  Q.start();
                }
              });
            },
            error: function(model,err) {
              Q.ok(false, err);
              Q.start();
            }
          });
        },
        error: function(model,err) {
          Q.ok(false, err);
          Q.start();
        }
      });
    });
  };
}());