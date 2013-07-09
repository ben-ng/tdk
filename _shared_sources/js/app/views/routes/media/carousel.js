(function () {
  var View = require('../../base')
    , Holder = require('../../../helpers/lib/holder.js')
    , CarouselView = View.extend({
        template: require('../../../templates/routes/media/carousel.hbs')
      , events: {
          'click a.bigClose':'exitPlayer'
        , 'click a.reelToggle':'toggleReel'
        , 'click a.app':'handleAppLink'
        }
        /* Tracks whether or not the reel is open */
      , reelOpen: null
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });
          var pages = this.app.db.fetchCollection('pages');

          this.listenTo(this.page, 'change', this.render, this);
          this.listenTo(this.app,'videoEnded',this.advance,this);

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

            this.listenTo(this.media, 'change add remove sort', this.render, this);
            this.media.once('ready', this.render, this);
          }, this);
        }
      , context: function () {
          var media = [];
          var safeName = encodeURIComponent(this.page.attributes.name);

          if(this.media) {
            this.media.forEach(function(model) {
              media.push(model.templateVars(safeName, true));
            });
          }

          return this.getContext({
            media: media
          , page: this.page.attributes
          });
        }
      , afterRender: function () {
          //Activate carousel
          this.$('.carousel').elastislide();

          //Initial load
          if(this.reelOpen === null) {
            this.toggleReel(null,false);
          }

          Holder.run();
        }

      , advance: function (lastMedia) {
          //Find the media element after lastMedia
          var self = this
            , lastElementWasMatch = false
            , matchedElement = null
            , playerUrl
            , safeName = encodeURIComponent(self.page.attributes.name)
            , i
            , ii
            , curModel
            , media = this.page.getMedia();

          if(this.page && media) {
            for(i=0, ii=media.models.length; i<ii; i++) {
              curModel = media.models[i];

              if(lastMedia.id === curModel.id) {
                lastElementWasMatch = true;
                continue;
              }
              if(lastElementWasMatch) {
                matchedElement = curModel;
                break;
              }
            }

            if(matchedElement) {
              playerUrl = matchedElement.templateVars(safeName).playerUrl;

              setTimeout(function () {
                self.app.navigate(playerUrl, {trigger:true});
              }, 1000);
            }
          }
        }

      , toggleReel: function(e, toggle) {
          var self = this;

          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          if(toggle !== false) {
            self.reelOpen = !self.reelOpen;
          }

          //Hide carousel?
          if(self.reelOpen) {
            self.$('.sliderWrap').slideDown(400);
            self.$('.symbol').html('&and;');
          }
          else {
            self.$('.sliderWrap').slideUp(400);
            self.$('.symbol').html('&or;');
          }
        }

      , exitPlayer: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.navigate('page/'+this.page.attributes.name,{trigger:true});
        }
      });

  module.exports = CarouselView;
}());