(function() {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db;
    
    Q.module("DB");
    
    Q.test("exists", function() {
      Q.ok(db, "DB exists");
    });
    
    Q.test("load doesNotExist", function() {
      Q.throws(function () {
        var model = db.loadModel('ZOOOBY');
      }, "Fails to load nonexistant model");
    });
    
    Q.test("load User", function() {
      var model = db.loadModel('user');
      
      Q.ok(model, "Loaded user");
      Q.equal(model.name, 'user', 'Name matches');
    });
    
    Q.test("load User CamelCase", function() {
      var model = db.loadModel('User');
      Q.ok(model, "Loaded user");
    });
    
    Q.test("load Image", function() {
      var model = db.loadModel('image');
      Q.ok(model, "Loaded image");
    });
    
    Q.test("load Video", function() {
      var model = db.loadModel('video');
      Q.ok(model, "Loaded video");
    });
    
    Q.test("load Page", function() {
      var model = db.loadModel('page');
      Q.ok(model, "Loaded page");
    });
    
    Q.test("load PageMedia", function() {
      var collection = db.loadCollection('pagemedia');
      Q.ok(collection, "Loaded pageMedia");
    });
    
    Q.test("load PageMedia CamelCase", function() {
      var collection = db.loadCollection('pageMedia');
      Q.ok(collection, "Loaded pageMedia");
    });
    
    Q.test("load Pages", function() {
      var collection = db.loadCollection('pages');
      Q.ok(collection, "Loaded pages");
    });
    
    Q.test("load UnprocessedUplaods", function() {
      var collection = db.loadCollection('unprocessedUploads');
      Q.ok(collection, "Loaded unprocessedUploads");
    });
  };
}());
