(function (){
  var path = require('path')
  , Q = require('qunitjs')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , App = require('../../_shared_sources/js/app/app.js')
  
  /*
  * Testing config options
  */
  , previewSize = 70 //% of screen the preview should occupy
  , delay = 500;    //milliseconds between each test?
  Q.config.reorder = false; //Don't reorder tests
  
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