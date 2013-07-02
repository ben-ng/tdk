(function () {
  var Q = require('qunitjs')
    , qunitTap = require('qunit-tap').qunitTap
    , _ = require('lodash');
  
  qunitTap(Q, _.bind(console.log, console));
  Q.config.updateRate = 0;
  
  // Don't re-order tests.
  Q.config.reorder = false;
  
  module.exports = Q;
}());