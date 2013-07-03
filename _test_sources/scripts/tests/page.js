(function () {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db
      , _page_user;
    
      Q.module("Page", {
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
        var page = db.createModel('page');
        Q.ok(page != null);
      });
      Q.asyncTest("Save, Update & Delete", 5, function() {
        var page = db.createModel('page');
        
        page.set({
          name:'Test Page',
          items:[],
          userId:_page_user.get("id")
        });
        
        page.save(null,{
          success:function() {
            Q.ok(page.attributes.errors == null, "Save errors: "+JSON.stringify(page.attributes.errors));
            
            //Perform an edit
            page.set("name","Changed Test Page");
            
            page.save(null,{
              success:function() {
                Q.ok(page.attributes.errors == null, "Save errors: "+JSON.stringify(page.attributes.errors));
                Q.ok(page.attributes.name === "Changed Test Page","Changed page name correctly");
                
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