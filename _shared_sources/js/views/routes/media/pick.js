(function () {
  var View = require('../../base')
    , _ = require('lodash')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , Holder = require('../../../helpers/lib/holder.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/media/pick.hbs')
      , events: {
          'click .reelgrid a': 'appendMedia'
        }
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });
          this.images = this.app.db.fetchCollection('images');
          this.videos = this.app.db.fetchCollection('videos');

          var pages = this.app.db.fetchCollection('pages');
          this.listenTo(this.images, 'add remove change sort', this.render, this);
          this.listenTo(this.videos, 'add remove change sort', this.render, this);
          this.listenTo(this.app.getUser(), 'change', this.render, this);

          // First make sure we can load the pages collection
          pages.once('ready', function () {
            var foundPage = pages.find(function (page) {
              return page.attributes.name.toLowerCase() === options.pageName.toLowerCase();
            });

            if(foundPage) {
              this.page = foundPage;

              this.listenTo(this.page, 'change ready', this.render, this);
            }
            else {
              this.page.set({name:'404'});
              this.app.error('Error 404: The page could not be found');
            }
          }, this);
        }
      , afterRender: function () {
        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });

        Holder.run();
      }
      , context: function () {
          var media = [];
          var safeName = encodeURIComponent(this.page.attributes.name);

          if(this.images) {
            this.images.forEach(function(model) {
              media.push(model.templateVars(safeName));
            });
          }
          if(this.videos) {
            this.videos.forEach(function(model) {
              media.push(model.templateVars(safeName));
            });
          }

          return this.getContext({
            media: media
          , page: this.page.attributes
          , uploadUrl: 'page/' + safeName + '/addMedia'
          });
        }
      , appendMedia: function (e) {
          e.preventDefault();
          e.stopPropagation();

          var self = this
            , safeName = self.page.attributes ? encodeURIComponent(self.page.attributes.name) : 'undefined'
            , newItems
            , target = e.target
            , media;

          while(target.tagName.toLowerCase() != 'a') {
            target = target.parentElement;
          }

          target = $(target);

          self.app.setFlash('info', 'Adding to page...');

          media = this.app.db.fetchModel(target.attr('data-media-type'), target.attr('data-media-id'));

          media.once('ready', function () {
            if(self.page.attributes.name !== 'Loading...') {
              // TODO: Find the item, and append it after ready
              newItems = _.clone(self.page.attributes.items);
              newItems.push({
                  ID: media.id
                , NAME: media.attributes.name
                , TYPE: media.attributes.type.toLowerCase()
                , THUMB: media.templateVars().thumbnailUrl
              });

              self.page.save({items: newItems}, {
                success: function () {
                  self.app.navigate('page/' + safeName, {trigger: true});
                  self.app.setFlash('success', 'Added!');
                }
              , error: self.app.error
              });
            }
            else {
              self.app.error('Please wait for the page to load before picking a media file');
            }
          });
        }
      });

  module.exports = IndexView;
}());
