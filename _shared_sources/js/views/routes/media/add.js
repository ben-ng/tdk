(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/media/add.hbs')
      , events: {
          'click a.filepicker':'startFilepicker'
        , 'click a.app': 'handleAppLink'
        }
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });
          var pages = this.app.db.fetchCollection('pages');

          this.listenTo(this.app.getUser(), 'change', this.render, this);

          // First make sure we can load the pages collection
          pages.once('ready', function () {
            var foundPage = pages.find(function (page) {
              return page.attributes.name.toLowerCase() === options.pageName.toLowerCase();
            });

            if(foundPage) {
              this.page = foundPage;
              this.listenTo(this.page, 'change', this.render, this);
            }
            else {
              this.page.set({name:'404'});
              this.app.error('Error 404: The page could not be found');
            }

            this.render();
          }, this);
        }
      , afterRender: function () {
        var inputElem;

        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
      , context: function () {
          var safeName = encodeURIComponent(this.page.attributes.name);

          return this.getContext({
            page: this.page.attributes
          , pickMediaUrl: 'page/'+safeName+'/pickMedia'
          });
        }
      , startFilepicker: function(e, debug_cb) {
          var self = this
            , safeName = encodeURIComponent(this.page.attributes.name);

          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          //Make sure the page is loaded
          if(!this.page.id) {
            self.app.error('The page hasn\'t loaded yet, try again in a few seconds');
            return;
          }

          this.page.addMedia(function(err, FPFiles) {
            if(err) {
              if(err.code === 304) {
                self.app.logoutFromInactivity();
              }
              else if(err.code!==101) {
                self.app.error(err);
              }
            }
            else if(FPFiles) {
              // No point staying on the upload page, huh..
              self.app.navigate('page/'+safeName, {trigger: true});
            }
          },debug_cb);
        }
      });

  module.exports = IndexView;
}());