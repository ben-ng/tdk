(function () {
  var View = require('ribcage-view')
    , NavbarView = View.extend({
        template: require('../templates/navbar.hbs')
        
      , context: function () {
          return {
            
          };
        }
      });
  
  module.exports = NavbarView;
}());