/*
* Dumbed-down index.js for testling
*/
(function (){
  var path = require('path')
  , Q = require('../qunit/qunit.testling.js')
  , Backbone = require('../../_shared_sources/js/app/helpers/BackboneLoader.js')
  , $ = require('../../_shared_sources/js/app/helpers/JqueryLoader.js')
  , _ = require('lodash')
  , App = require('../../_shared_sources/js/app/app.js')

  //TESTS
  , tests = require('./tests')

  //Tests that can't run on testling go here
  , exclude = ['user']

  /*
  * Testing config options
  */
  , testRunnerSize = 50 //% of screen the test runner should occupy
  , delay = 0;    //milliseconds between each test?

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

    _.each(tests, function (test, key) {
      if(exclude.indexOf(key) < 0) {
        test(window.App, Q, Backbone, fixture, delay);
      }
    });
  };
}());