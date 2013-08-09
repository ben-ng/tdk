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

          this.listenTo(this.app.getUser(), 'change', this.render, this);

          this.fetchPage(options.pageName, function () {
            this.render();
          });
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