(function () {
  var View = require('ribcage-view')
    , NavbarView = require('./navbar.js')
    , IndexView = View.extend({
        template: require('../templates/index.hbs')
      , afterRender: function () {
        this.navbar = new NavbarView();
        this.appendSubview(this.navbar, this.$('#header'));
        
        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
      });
  
  module.exports = IndexView;
}());