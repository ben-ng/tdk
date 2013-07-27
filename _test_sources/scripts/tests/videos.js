(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db
      , _video_user;

    Q.module("Videos", {
      setup: function() {
        if(!_video_user) {
          Q.stop();
          _video_user = db.createModel('user').set({id:'test'});
          _video_user.save(null,{
            success:function() {
              Q.notEqual(_video_user.attributes.token, false);
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
      var videos = db.createCollection('videos');
      Q.ok(videos != null);
    });
    Q.asyncTest("Fetch: zero", 2, function() {
      var videos = db.createCollection('videos');
      videos.fetch({
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
      var videos = db.createCollection('videos');
      var video = db.createModel('video').set({
        name:'Test Video',
        fpkey:'baz',
        mimeType:'video/mp4',
        originalFilesize:9000,
        userId:_video_user.id,
        attribs:[{author:'Tom',year:1991}],
        status:0,
        debug:true
      });
      video.save(null,{
        success:function() {
          Q.equal(video.attributes.errors, null, "Save errors: "+JSON.stringify(video.attributes.errors));

          videos.fetch({
            success:function(collection, response, options) {
              Q.strictEqual(collection.length, 1, "Collection should have one video");
              //Destroy the video
              video.destroy({
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
      var videos = db.createCollection('videos');
      var video = db.createModel('video').set({
        name:'Test Video',
        fpkey:'baz',
        mimeType:'video/mp4',
        originalFilesize:9000,
        userId:_video_user.id,
        attribs:[{author:'Tom',year:1991}],
        status:0,
        debug:true
      });
      var video2 = db.createModel('video').set({
        name:'Test Video 2',
        fpkey:'baz',
        mimeType:'video/mp4',
        originalFilesize:9000,
        userId:_video_user.id,
        attribs:[{author:'Tom',year:1991}],
        status:0,
        debug:true
      });
      video.save(null,{
        success:function() {
          Q.equal(video.attributes.errors, null, "Save errors: "+JSON.stringify(video.attributes.errors));

          video2.save(null,{
            success:function() {
              Q.equal(video2.attributes.errors, null, "Save errors: "+JSON.stringify(video2.attributes.errors));

              videos.fetch({
                success:function(collection, response, options) {
                  Q.strictEqual(collection.length, 2, "Collection should have two videos");
                  //Destroy the video
                  video.destroy({
                    success:function(model,resp) {
                      Q.ok(true);
                      //Destroy the video
                      video2.destroy({
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