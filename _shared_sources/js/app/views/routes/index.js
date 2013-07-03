(function () {
  var View = require('../base')
    , NavbarView = require('../layout/navbar.js')
    , FooterView = require('../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../templates/routes/index.hbs')
      , initialize: function (options) {
          this.app = options.app;
        }
      , afterRender: function () {
        this.navbar = new NavbarView({app:this.app});
        this.appendSubview(this.navbar, this.$('#header'));
        
        this.footer = new FooterView({app:this.app});
        this.appendSubview(this.footer, this.$('#footer'));
        
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
