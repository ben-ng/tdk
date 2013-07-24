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
        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        navbar.remove();
        footer.remove();

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

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
