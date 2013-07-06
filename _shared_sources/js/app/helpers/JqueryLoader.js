(function () {
  var $ = require('jquery-browserify')
    , elastislide = require('./lib/elastislide');

  // Applies the plugin
  elastislide($, window);

  module.exports = $;
}());