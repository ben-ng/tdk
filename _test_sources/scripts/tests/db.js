(function() {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db;
    
    Q.module("DB");
    
    Q.test("exists", function() {
      Q.ok(db, "DB exists");
    });
    
    Q.test("load doesNotExist", function() {
      Q.throws(function () {
        var model = db.createModel('ZOOOBY');
      }, "Fails to load nonexistant model");
    });
    
    Q.test("load User", function() {
      var model = db.createModel('user');
      
      Q.ok(model, "Loaded user");
      Q.equal(model.name, 'user', 'Name matches');
    });
    
    Q.test("load User CamelCase", function() {
      var model = db.createModel('User');
      Q.ok(model, "Loaded user");
    });
    
    Q.test("load User Unique", function() {
      var model = db.createModel('User')
        , model2 = db.createModel('User');
      
      Q.deepEqual(model.attributes, model2.attributes, "Users should be identical");
      
      model.set('username','chicken');
      
      Q.notDeepEqual(model.attributes, model2.attributes, "Users should be different");
    });
    
    Q.test("load Image", function() {
      var model = db.createModel('image');
      Q.ok(model, "Loaded image");
    });
    
    Q.test("load Video", function() {
      var model = db.createModel('video');
      Q.ok(model, "Loaded video");
    });
    
    Q.test("load Page", function() {
      var model = db.createModel('page');
      Q.ok(model, "Loaded page");
    });
    
    Q.test("load PageMedia", function() {
      var collection = db.createCollection('pagemedia');
      Q.ok(collection, "Loaded pageMedia");
    });
    
    Q.test("load PageMedia CamelCase", function() {
      var collection = db.createCollection('pageMedia');
      Q.ok(collection, "Loaded pageMedia");
    });
    
    Q.test("load Pages", function() {
      var collection = db.createCollection('pages');
      Q.ok(collection, "Loaded pages");
    });
    
    Q.test("load UnprocessedUploads", function() {
      var collection = db.createCollection('unprocessedUploads');
      Q.ok(collection, "Loaded unprocessedUploads");
    });
  };
}());
