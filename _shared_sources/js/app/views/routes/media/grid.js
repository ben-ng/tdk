(function () {
  var View = require('../../base')
    , Holder = require('../../../helpers/lib/holder.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/media/grid.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });
          var pages = this.app.db.fetchCollection('pages');

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

            this.media = this.page.getMedia();

            // Re-fetch, things might have been updated.
            this.media.fetch();

            this.listenTo(this.media, 'change add remove sort', this.render, this);
            this.media.once('ready', this.render, this);
          }, this);
        }
      , context: function () {
          var media = [];
          var safeName = encodeURIComponent(this.page.attributes.name);

          if(this.media) {
            this.media.forEach(function(model) {
              media.push(model.templateVars(safeName));
            });
          }

          return this.getContext({
            media: media
          , page: this.page.attributes
          });
        }
      , afterRender: function () {
          Holder.run();
        }
      });

  module.exports = IndexView;
}());
