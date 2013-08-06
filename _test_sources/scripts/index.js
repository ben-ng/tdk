/*
* Travis and local test entry file
*/
(function () {
  var path = require('path')
  , _ = require('lodash')
  , Q = require('../qunit/qunit.selected.js')
  , Backbone = require('../../_shared_sources/js/helpers/BackboneLoader.js')
  , $ = require('../../_shared_sources/js/helpers/JqueryLoader.js')
  , App = require('../../_shared_sources/js/app.js')
  , host = window.document.location.host.replace(/:.*/, '')
  , ws = new WebSocket('ws://'+host+':8081')

  // TESTS
  , tests = require('./tests')

  /*
  * Testing config options
  */
  , testRunnerSize = 50 //% of screen the test runner should occupy
  , delay = 0;        //milliseconds between each test?

  /* Force the environment variables! */
  process.env.NODE_ENV = 'staging';
  process.env.CI = true;
  process.env.tests = true;

  window.onload = function () {
    var fixture = $('#qunit-fixture')
      , testList = $("#qunit");

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

    _.each(tests, function (test) {
      test(window.App, Q, Backbone, fixture, delay);
    });

    /* Hot-reload code */
    ws.onmessage = function(event) {
      if(event.data == 'reload') {
        window.location.reload(true);
      }
    };
  };
}());