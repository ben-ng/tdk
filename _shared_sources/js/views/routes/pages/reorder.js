(function () {
  var async = require('async')
    , View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , ReorderView = View.extend({
        template: require('../../../templates/routes/pages/reorder.hbs')
      , events: {
          'submit': 'performSave'
        }
      , initialize: function (options) {
          this.app = options.app;
          this.pages = this.app.db.fetchCollection('pages');

          this.renderOnReady(this.pages);
        }
      , context: function () {
          var pages = this.pages.map(function (page) {
            return page.attributes;
          });

          return this.getContext({
            pages: pages
          });
        }
      , afterRender: function () {
          var self = this
            , navbar = new NavbarView({app:self.app})
            , footer = new FooterView({app:self.app});

          self.appendSubview(navbar, self.$('#header'));
          self.appendSubview(footer, self.$('#footer'));

          //Render all the subviews
          self.eachSubview(function (subview) {
            subview.render();
          });

          self.$('.sortable').sortable().bind('sortupdate', function() {
            //
          });
        }

        //Reads the sorting order of items on the page
      , readSortOrder: function() {
          var self = this;

          var items = self.$('.sortable').children()
            , models = []
            , saves = [];

          items.each(function(index,elem) {
            var fModel = self.pages.get($(elem).attr("data-uuid"));

            fModel.set('priority', index);

            models.push(fModel);

            saves.push(function (next) {
              fModel.save({}, {
                success: next
              });
            });
          });

          self.pages.reset(models).sort();

          async.parallel(saves, function () {
            self.app.setFlash('success', 'Page order saved!');

            self.$('button').button('reset');
          });
        }
      , performSave: function (e) {
          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          this.app.clearFlash();

          this.$('button').button('loading');

          this.readSortOrder();
        }
      });

  module.exports = ReorderView;
}());
