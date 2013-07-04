(function() {
  module.exports = function (App, Q, Backbone, fixture, delay) {
    var db = App.db;
    
    Q.module("DB");
    
    Q.test("exists", function() {
      Q.ok(db, "DB exists");
    });
    
      Q.test("create doesNotExist", function() {
      Q.throws(function () {
        var model = db.createModel('ZOOOBY');
      }, "Fails to create nonexistant model");
    });
    
    Q.test("create User", function() {
      var model = db.createModel('user');
      
      Q.ok(model, "Created user");
      Q.equal(model.name, 'user', 'Name matches');
    });
    
    Q.test("create User CamelCase", function() {
      var model = db.createModel('User');
      Q.ok(model, "Created user");
    });
    
    Q.test("create User Unique", function() {
      var model = db.createModel('User')
        , model2 = db.createModel('User');
      
      Q.deepEqual(model.attributes, model2.attributes, "Users should be identical");
      
      model.set('username','chicken');
      
      Q.notDeepEqual(model.attributes, model2.attributes, "Users should be different");
    });
    
    Q.test("create Image", function() {
      var model = db.createModel('image');
      Q.ok(model, "Created image");
    });
    
    Q.test("create Video", function() {
      var model = db.createModel('video');
      Q.ok(model, "Created video");
    });
    
    Q.test("create Page", function() {
      var model = db.createModel('page');
      Q.ok(model, "Created page");
    });
    
    Q.test("create PageMedia", function() {
      var collection = db.createCollection('pagemedia');
      Q.ok(collection, "Created pageMedia");
    });
    
    Q.test("create PageMedia CamelCase", function() {
      var collection = db.createCollection('pageMedia');
      Q.ok(collection, "Created pageMedia");
    });
    
    Q.test("create Pages", function() {
      var collection = db.createCollection('pages');
      Q.ok(collection, "Created pages");
    });
    
    Q.test("create UnprocessedUploads", function() {
      var collection = db.createCollection('unprocessedUploads');
      Q.ok(collection, "Created unprocessedUploads");
    });
    
    /*
    * Important tests that make sure we can do things like:
    *
    * var myThing = db.loadModel('thing');
    * myThing.once('ready',this.render);
    *
    * and be confident that the `.once` call will happen
    * regardless of whether object is fetched or served
    * from the cache
    */
    Q.asyncTest("fetch collection", 3, function() {
      var buff = '1'
        , collection = db.fetchCollection('unprocessedUploads')
        , sameCollection;
      
      buff = buff + '2';
      
      Q.ok(collection, "Loaded unprocessedUploads");
      
      buff = buff + '3';
      
      collection.once('ready', function () {
        buff = buff + '5';
        
        Q.strictEqual(buff, '12345', 'Initial fetch order is expected');
        
        buff = buff + '6';
        
        sameCollection = db.fetchCollection('unprocessedUploads');
        
        buff = buff + '7';
        
        sameCollection.once('ready', function () {
          buff = buff + '9';
        
          Q.strictEqual(buff, '123456789', 'Subsequent fetch order is expected');
          Q.start();
        });
        
        buff = buff + '8';
      });
      
      buff = buff + '4';
    });
    
    Q.asyncTest("fetch model", 3, function() {
      var buff = '1'
        , model = db.fetchModel('user')
        , sameModel;
      
      buff = buff + '2';
      
      Q.ok(model, "Loaded user");
      
      buff = buff + '3';
      
      model.once('ready', function () {
        buff = buff + '5';
        
        Q.strictEqual(buff, '12345', 'Initial fetch order is expected');
        
        buff = buff + '6';
        
        sameModel = db.fetchModel('user');
        
        buff = buff + '7';
        
        sameModel.once('ready', function () {
          buff = buff + '9';
        
          Q.strictEqual(buff, '123456789', 'Subsequent fetch order is expected');
          Q.start();
        });
        
        buff = buff + '8';
      });
      
      buff = buff + '4';
    });
    
    Q.asyncTest("fetch multiple instances of model", 4, function() {
      var buff = ''
        , modelA = db.fetchModel('user')
        , modelB = db.fetchModel('user')
        , modelC = db.fetchModel('user')
        , timeout
        , next = function (entry) {
            buff = buff + entry;
            
            clearTimeout(timeout);
            timeout = setTimeout(function () {
              // Ensure that only one of each character is in buff
              Q.strictEqual(buff.length, 3, buff + ' should be "ABC" or similar');
              Q.ok(buff.indexOf('A')>=0);
              Q.ok(buff.indexOf('B')>=0);
              Q.ok(buff.indexOf('C')>=0);
              
              Q.start();
            }, 1000);
          };
      
      modelA.once('ready', function () {
        next('A');
      });
      modelB.once('ready', function () {
        next('B');
      });
      modelC.once('ready', function () {
        next('C');
      });
    });
  };
}());
