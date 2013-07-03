(function () {
  var View = require('./base')
    , NavbarView = require('./navbar.js')
    , IndexView = View.extend({
        template: require('../templates/index.hbs')
      , initialize: function (options) {
          this.app = options.app;
        }
      , afterRender: function () {
        this.navbar = new NavbarView({app:this.app});
        this.appendSubview(this.navbar, this.$('#header'));
        
        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
      , context: function () {
          return this.getContext();
        }
      });
  
  module.exports = IndexView;
}());
