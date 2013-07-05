(function () {
  var View = require('../base')
    , NavbarView = require('../layout/navbar.js')
    , FooterView = require('../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../templates/routes/review.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.unprocessed = this.app.db.fetchCollection('unprocessedUploads');

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.unprocessed, 'add change remove sort', this.render, this);

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
          var unprocessedAttrs = [];

          this.unprocessed.forEach(function(model) {
            var attrs = model.attributes;
            attrs.editHref = '/media/'+attrs.type+'/'+model.id+'/edit';
            unprocessedAttrs.push(attrs);
          });

          return this.getContext({
            unprocessed:unprocessedAttrs
          , nothingToReview: unprocessedAttrs.length === 0
          });
        }
      });

  module.exports = IndexView;
}());
