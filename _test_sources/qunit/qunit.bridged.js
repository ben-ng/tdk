(function () {
  var Q = require('qunitjs');
  
  /*
  * Grunt-Phantomjs Bridge
  * https://github.com/gruntjs/grunt-contrib-qunit/blob/master/phantomjs/bridge.js
  */
  
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
  
  module.exports = Q;
}());