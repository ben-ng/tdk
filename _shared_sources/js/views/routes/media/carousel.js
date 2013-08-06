(function () {
  var View = require('../../base')
    , Backbone = require('../../../helpers/BackboneLoader.js')
    , Holder = require('../../../helpers/lib/holder.js')
    , CarouselView = View.extend({
        template: require('../../../templates/routes/media/carousel.hbs')
      , events: {
          'click a.bigClose':'exitPlayer'
        , 'click a.reelToggle':'toggleReel'
        , 'click a.app':'handleAppLink'
        , 'click a.goLeft':'handleLeftButton'
        , 'click a.goRight':'handleRightButton'
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
          var currentMedia = this.currentMedia();

          //Activate carousel
          this.$('.carousel').elastislide();

          //Initial load
          if(this.reelOpen === null) {
            this.toggleReel(null,false, 0);
          }

          Holder.run();

          //Selectively show arrows
          if(currentMedia) {
            if(this.advance(currentMedia, true)) {
              this.$('a.goRight').removeClass('hidden');
            }
            if(this.reverse(currentMedia, true)) {
              this.$('a.goLeft').removeClass('hidden');
            }
          }
        }

      , advance: function (lastMedia, mock, delay) {
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

          if(delay == null) {
            delay = 1000;
          }

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

              if(mock) {
                return true;
              }
              else {
                setTimeout(function () {
                  self.app.navigate(playerUrl, {trigger:true});
                }, delay);
              }
            }
          }

          return false;
        }

      , reverse: function (lastMedia, mock, delay) {
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

          if(delay == null) {
            delay = 1000;
          }

          if(this.page && media) {
            for(i=media.models.length-1, ii=0; i>=ii; i--) {
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

              if(mock) {
                return true;
              }
              else {
                setTimeout(function () {
                  self.app.navigate(playerUrl, {trigger:true});
                }, delay);
              }
            }
          }

          return false;
        }

      , handleLeftButton: function (e) {
          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          this.reverse(this.currentMedia(), false, 0);
        }

      , handleRightButton: function (e) {
          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          this.advance(this.currentMedia(), false, 0);
        }

      , currentMedia: function () {
          if(!this.media) {
            return false;
          }

          return this.media.findWhere({id: Backbone.history.fragment.split('/').pop()});
        }

      , toggleReel: function (e, toggle, duration) {
          var self = this;

          if(duration == null) {
            duration = 400;
          }

          if(e) {
            e.preventDefault();
            e.stopPropagation();
          }

          if(toggle !== false) {
            self.reelOpen = !self.reelOpen;
          }

          //Hide carousel?
          if(self.reelOpen) {
            self.$('.sliderWrap').slideDown(duration);
            self.$('.symbol').html('&and;');
          }
          else {
            self.$('.sliderWrap').slideUp(duration);
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