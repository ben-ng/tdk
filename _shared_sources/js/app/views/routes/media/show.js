(function () {
  var View = require('../../base')
    , _ = require('lodash')
    , CarouselView = require('./carousel')
    , vjs = require('../../../helpers/lib/video')
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

          // Re-fetch if not fresh
          if(this.page.id) {
            this.page.fetch();
          }
          if(this.media.id) {
            this.media.fetch();
          }

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
        var self = this
          , carouselView = new CarouselView({
              app:this.app
            , pageName:this.pageName
            })
          , waitFor = 2
          , afterVideoLoad = function(e) {
              waitFor--;

              //Metadata Loaded Callback
              if(e) {
                videoDims = {height:this.videoHeight, width:this.videoWidth};
              }

              if(waitFor === 0) {
                //Limit to 960x540
                if(videoDims.width>960) {
                  videoDims.height = videoDims.height * (960 / videoDims.width);
                  videoDims.width = 960;
                }

                player = vjs(self.app.config.videoPlayerId);
                player.width(videoDims.width);
                player.height(videoDims.height);
                player.on("ended",function () {
                  self.app.trigger("videoEnded",self.media);
                });
                setTimeout(function () {
                  player.play();
                }, 1000);
              }
            };

        this.appendSubview(carouselView, this.$('#carouselWrapper'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });

        //Activate VJS
        if(this.media.attributes.type === 'video') {
          _.defer(function () {
            //Reset players object, otherwise it won't be initialized properly by VJS
            vjs.players = {};
            vjs(this.app.config.videoPlayerId,{preload:true},afterVideoLoad);
            this.$("video").on('loadedmetadata', afterVideoLoad);
          }, this);
        }
      }
      , context: function () {
          return this.getContext({
            media: this.media.templateVars()
          });
        }
      });

  module.exports = ShowView;
}());