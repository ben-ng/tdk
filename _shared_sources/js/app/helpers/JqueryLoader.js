(function () {
  var $ = require('jquery-browserify');

  // Applies the plugins
  (require('./lib/elastislide'))($, window);
  (require('./lib/switch'))($, window);
  (require('./lib/sortable'))($, window);
  (require('./lib/tags'))($, window);

  module.exports = $;
}());