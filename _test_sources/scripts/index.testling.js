/**
* Dumbed-down index.js for testling
*/
(function (){
  var path = require('path')
  , Q = require('../qunit/qunit.testling.js')
  , Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , App = require('../../_shared_sources/js/app/app.js')
  
  //TESTS
  , db = require('./db.js')
  
  /*
  * Testing config options
  */
  , testRunnerSize = 50 //% of screen the test runner should occupy
  , delay = 500;    //milliseconds between each test?
  
  /* Hook up jquery to backbone */
  Backbone.$ = $;
  
  window.onload = function () {
    var fixtureElem = document.createElement("div")
      , testListElem = document.createElement("div")
      , fixture
      , testList;
    
    fixtureElem.setAttribute('id', 'qunit-fixture');
    testListElem.setAttribute('id', 'qunit');
    
    document.body.appendChild(fixtureElem);
    document.body.appendChild(testListElem);
    
    fixture = $('#qunit-fixture')
    testList = $("#qunit");
    
    // Move the fixture back on screen so we can see it
    fixture.css({
      position: 'absolute'
    , width: '100%'
    , top: 0
    , left: 0
    , zIndex: 0
    });
    
    testList.css({
      position: 'absolute'
    , width: testRunnerSize + '%'
    , top: 0
    , left: (100 - testRunnerSize) + "%"
    , zIndex: 1
    });
    
    window.App = new App(fixture[0]);
    window.App.start();
    
    db(window.App, Q, Backbone, fixture, delay);
  };
}());