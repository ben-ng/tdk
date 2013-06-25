(function () {
  var Q = require('qunitjs')
    , qunitTap = require('qunit-tap').qunitTap
    , _ = require('lodash');
  
  qunitTap(Q, _.bind(console.log, console));
  Q.config.updateRate = 0;
  
  module.exports = Q;
}());