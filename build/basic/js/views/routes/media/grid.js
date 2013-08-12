(function () {
  var View = require('../../base')
    , Holder = require('../../../helpers/lib/holder.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/media/grid.hbs')
      , initialize: function (options) {
          this.app = options.app;

          var unprocessed = this.app.db.fetchCollection('unprocessedUploads');

          this.fetchPage(options.pageName, function () {

            this.media = this.page.getMedia();

            // Re-fetch, things might have been updated.
            this.media.fetch();

            this.listenTo(this.media, 'ready change add remove sort', this.render, this);

            // Resets the thumbnails if something changes
            this.listenTo(unprocessed, 'add change remove reset sync', function () {
              this.media.fetch();
            }, this);

            this.render();
          });
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
