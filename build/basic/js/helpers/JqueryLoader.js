(function () {
  var $ = require('jquery-browserify');

  // Applies the plugins
  (require('./lib/elastislide'))($, window);
  (require('./lib/switch'))($, window);
  (require('./lib/sortable'))($, window);
  (require('./lib/tags'))($, window);
  (require('./lib/bootstrap-button'))($, window);
  (require('./lib/bootstrap-tooltip'))($, window);
  (require('./lib/bootstrap-popover'))($, window);
  (require('./lib/bootstrap-alert'))($, window);

  module.exports = $;
}());