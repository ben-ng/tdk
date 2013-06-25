(function (){
  var path = require('path')
  , Q = require('qunitjs')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , App = require('../../_shared_sources/js/app/app.js')
  
  //This is the grunt bridge
  
  // Don't re-order tests.
  Q.config.reorder = false;
  // Run tests serially, not in parallel.
  Q.config.autorun = false;

  // Send messages to the parent PhantomJS process via alert! Good times!!
  function sendMessage() {
    var args = [].slice.call(arguments);
    alert(JSON.stringify(args));
  }

  // These methods connect Q to PhantomJS.
  Q.log(function(obj) {
    // What is this I don’t even
    if (obj.message === '[object Object], undefined:undefined') { return; }
    // Parse some stuff before sending it.
    var actual = Q.jsDump.parse(obj.actual);
    var expected = Q.jsDump.parse(obj.expected);
    // Send it.
    sendMessage('qunit.log', obj.result, actual, expected, obj.message, obj.source);
  });

  Q.testStart(function(obj) {
    sendMessage('qunit.testStart', obj.name);
  });

  Q.testDone(function(obj) {
    sendMessage('qunit.testDone', obj.name, obj.failed, obj.passed, obj.total);
  });

  Q.moduleStart(function(obj) {
    sendMessage('qunit.moduleStart', obj.name);
  });

  Q.moduleDone(function(obj) {
    sendMessage('qunit.moduleDone', obj.name, obj.failed, obj.passed, obj.total);
  });

  Q.begin(function() {
    sendMessage('qunit.begin');
  });

  Q.done(function(obj) {
    sendMessage('qunit.done', obj.failed, obj.passed, obj.total, obj.runtime);
  });
  
  /*
  * Testing config options
  */
  , previewSize = 70 //% of screen the preview should occupy
  , delay = 500;    //milliseconds between each test?
  
  Backbone.$ = $;
  
  window.onload = function () {
    var fixture = $('#qunit-fixture')
      , testList = $("#qunit");
    
    // Move the fixture back on screen so we can see it
    fixture.css({
      position: 'absolute'
    , width: previewSize + '%'
    , top: 0
    , left: 0
    });
    
    testList.css({
      position: 'absolute'
    , width: (100-previewSize) + '%'
    , top: 0
    , left: previewSize + "%"
    });
    
    window.App = new App(fixture[0]);
    window.App.start();
    
    Q.module("Index", {
      setup: function () {
        Backbone.history.fragment = null;
        Backbone.history.navigate('', true);
      }
    , teardown: function () {
        Q.stop();
        
        setTimeout(function () {
          Backbone.history.fragment = null;
          Backbone.history.navigate('', true);
          Q.start();
        }, delay);
      }
    });
    Q.asyncTest("Divs exist", 1, function() {
      Q.equal(fixture.find('div').length, 7, "Divs exist");
      
      Q.start();
    });
    Q.asyncTest("Divs don't exist", 1, function() {
      Q.equal(fixture.find('div').length, 6, "Divs exist");
      
      Q.start();
    });
  };
}());