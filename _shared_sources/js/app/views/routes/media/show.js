(function () {
  var View = require('../../base')
    , CarouselView = require('./carousel')
    , ShowView = View.extend({
        template: require('../../../templates/routes/media/show.hbs')
      , events: {
        }
      , initialize: function (options) {
          this.app = options.app;
          this.pageName = options.pageName;
          this.mediaType = options.mediaType;
          this.mediaId = options.mediaId;

          var pages = this.app.db.fetchCollection('pages');

          this.page = this.app.db.fetchModel('page', options.mediaId);
          this.media = this.app.db.fetchModel(options.mediaType, options.mediaId);

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.page, 'change', this.render, this);
          this.listenTo(this.media, 'change', this.render, this);


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
        var carouselView = new CarouselView({
          app:this.app
        , pageName:this.pageName
        });

        this.appendSubview(carouselView, this.$('#carouselWrapper'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
      , context: function () {
          return this.getContext({
            media: this.media.templateVars()
          });
        }
      });

  module.exports = ShowView;
}());