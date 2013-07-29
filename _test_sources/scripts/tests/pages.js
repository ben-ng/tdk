(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db
      , _page_user;

    Q.module("Pages", {
      setup: function() {
        if(!_page_user) {
          Q.stop();
          _page_user = db.createModel('user').set({id:'test'});
          _page_user.save(null,{
            success:function() {
              Q.notEqual(_page_user.attributes.token, false);
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
      var pages = db.createCollection('pages');
      Q.ok(pages != null);
    });
    Q.asyncTest("Fetch: zero", 2, function() {
      var pages = db.createCollection('pages');
      pages.fetch({
        success:function(collection, response, options) {
          Q.strictEqual(collection.length, 0, "Collection should be initially empty");
          Q.start();
        },
        error:function(collection, response, options) {
          Q.ok(false, "Failed to perform fetch");
          console.log(arguments);
          Q.start();
        }
      });
    });
    Q.asyncTest("Fetch: one", 4, function() {
      var pages = db.createCollection('pages');
      var page = db.createModel('page').set({
        name:'Test Page',
        items:[],
        userId:_page_user.get("id")
      });
      page.save(null,{
        success:function() {
          Q.equal(page.attributes.errors, null, "Save errors: "+JSON.stringify(page.attributes.errors));

          pages.fetch({
            success:function(collection, response, options) {
              Q.strictEqual(collection.length, 1, "Collection should have one page");
              //Destroy the page
              page.destroy({
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
      var pages = db.createCollection('pages');
      var page = db.createModel('page').set({
        name:'Test Page',
        items:[],
        userId:_page_user.get("id")
      });
      var page2 = db.createModel('page').set({
        name:'Test Page 2',
        items:[],
        userId:_page_user.get("id")
      });
      page.save(null,{
        success:function() {
          Q.equal(page.attributes.errors, null, "Save errors: "+JSON.stringify(page.attributes.errors));

          page2.save(null,{
            success:function() {
              Q.equal(page2.attributes.errors, null, "Save errors: "+JSON.stringify(page2.attributes.errors));

              pages.fetch({
                success:function(collection, response, options) {
                  Q.strictEqual(collection.length, 2, "Collection should have two pages");
                  //Destroy the page
                  page.destroy({
                    success:function(model,resp) {
                      Q.ok(true);
                      //Destroy the page
                      page2.destroy({
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