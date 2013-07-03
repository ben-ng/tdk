(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var _addMedia_user
      , db = App.db;

    Q.module("AddMedia", {
      setup: function() {
        if(!_addMedia_user) {
          Q.stop();
          _addMedia_user = db.createModel('user').set({id:'test'});
          _addMedia_user.save(null,{
            success:function() {
              Q.notEqual(_addMedia_user.attributes.token, false);
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
    Q.asyncTest("Add media to page", 9, function() {
      var page = new Website.Models.Page({
        name:'Add Media Test Page',
        items:[],
        userId:_addMedia_user.get("id")
      });
      page.save(null,{
        success:function() {
          var addMedia = new Website.Views.AddMedia({page:page});
          Q.ok(addMedia != null);
          addMedia.startFilepicker(null,function() {
            //Called after dummy file is saved
            //And the model has been re-fetched
            Q.strictEqual(page.attributes.items.length,1);
            //Check if the page media is correct
            page.media.fetch({
              success:function() {
                Q.strictEqual(page.media.length,1,'Media collection should have one item');
                Q.strictEqual(page.media.at(0).attributes.id,page.attributes.items[0].ID,'Media item should have same id');
                //Check if the number of unprocessed uploads is correct
                var unprocessed = new Website.Collections.UnprocessedUploads();
                unprocessed.fetch({
                  success:function() {
                    Q.strictEqual(unprocessed.length,1,'There should be one unprocessed item');
                    if(unprocessed.length) {
                      Q.strictEqual(unprocessed.at(0).attributes.id,page.attributes.items[0].ID,'Unprocessed item should have same id');
                    }
                    else {
                      Q.ok(false,'See previous test');
                    }
                    page.destroy({
                      success:function() {
                        Q.ok(true);
                        //Destroy the test image
                        var destImage = new Website.Models.Image();
                        destImage.set("id",page.attributes.items[0].ID);
                        destImage.destroy({
                          success:function() {
                            Q.ok(true);
                            Q.start();
                          },
                          error:function(model, err) {
                            Q.ok(false,err);
                            Q.start();
                          }
                        });
                      },
                      error:function(model, err) {
                        Q.ok(false,err);
                        Q.start();
                      }
                    });
                  },
                  error:function(model, err) {
                    Q.ok(false,err);
                    Q.start();
                  }
                });
              },
              error:function(model, err) {
                Q.ok(false,err);
                Q.start();
              }
            });
          });
        },
        error:function(model, err) {
          Q.ok(false,err);
          Q.start();
        }
      });
    });
  };
}());
