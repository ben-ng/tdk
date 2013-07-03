(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var _video_user
      , db = App.db;
    
    Q.module("Video", {
      setup: function() {
        if(!_video_user) {
          Q.stop();
          _video_user = db.createModel('user').set({id:'test'});
          _video_user.save(null,{
            success:function() {
              Q.notEqual(_video_user.attributes.token, false);
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
      var video = db.createModel('video');
      Q.ok(video != null);
    });
    Q.asyncTest("Save, Update & Delete", 18, function() {
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
          Q.strictEqual(video.attributes.name, "Test Video");
          Q.strictEqual(video.attributes.fpkey, "baz");
          Q.strictEqual(video.attributes.mimeType, "video/mp4");
          Q.strictEqual(video.attributes.originalFilesize, 9000);
          Q.strictEqual(video.attributes.userId, _video_user.get("id"));
          Q.deepEqual(video.attributes.attribs, [{author:'Tom',year:1991}]);
          Q.strictEqual(video.attributes.status, 0);
          
          //Perform an edit
          video.set("name","Changed Test Video");
          video.set("debug",true);
          
          video.save(null,{
            success:function() {
              Q.equal(video.attributes.errors, null, "Save errors: "+JSON.stringify(video.attributes.errors));
              Q.strictEqual(video.attributes.name, "Changed Test Video","Changed video name correctly");
              Q.strictEqual(video.attributes.fpkey, "baz");
              Q.strictEqual(video.attributes.mimeType, "video/mp4");
              Q.strictEqual(video.attributes.originalFilesize, 9000);
              Q.strictEqual(video.attributes.userId, _video_user.get("id"));
              Q.deepEqual(video.attributes.attribs, [{author:'Tom',year:1991}]);
              Q.strictEqual(video.attributes.status, 0);
              
              //Destroy the video
              video.destroy({
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
