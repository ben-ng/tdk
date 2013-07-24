(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , GridView = require('../../routes/media/grid.js')
    , ShowView = View.extend({
        template: require('../../../templates/routes/pages/show.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });

          this.pageName = options.pageName;

          var pages = this.app.db.fetchCollection('pages');

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.page, 'change', this.render, this);

          // First make sure we can load the pages collection
          pages.once('ready', function () {
            var foundPage = pages.find(function (page) {
              return page.attributes.name.toLowerCase() === options.pageName.toLowerCase();
            });

            if(foundPage) {
              // This weirdness so that bound events get called
              this.page.set(foundPage.attributes);
            }
            else {
              this.page.set({name:'404'});
              this.app.error('Error 404: The page could not be found');
            }
          }, this);
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
