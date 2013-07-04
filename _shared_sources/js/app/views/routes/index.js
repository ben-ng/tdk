(function () {
  var View = require('../base')
    , NavbarView = require('../layout/navbar.js')
    , FooterView = require('../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../templates/routes/index.hbs')
      , initialize: function (options) {
          this.app = options.app;
          
          this.listenTo(this.app.getUser(), 'change', this.render, this);
        }
      , afterRender: function () {
        this.navbar = this.navbar || new NavbarView({app:this.app});
        this.footer = this.footer || new FooterView({app:this.app});
        
        this.navbar.remove();
        this.footer.remove();
        
        this.appendSubview(this.navbar, this.$('#header'));
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
