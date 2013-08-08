(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , GridView = require('../../routes/media/grid.js')
    , ShowView = View.extend({
        template: require('../../../templates/routes/pages/show.hbs')
      , initialize: function (options) {
          this.app = options.app;

          this.pageName = options.pageName;

          this.listenTo(this.app.getUser(), 'change', this.render, this);

          this.fetchPage(options.pageName, function () {
            this.render();
          });
        }
      , afterRender: function () {
        var navbar = new NavbarView({app:this.app})
          , grid = new GridView({app:this.app, pageName:this.pageName})
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(grid, this.$('#content'));
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

  module.exports = ShowView;
}());
