(function () {
  var View = require('../../base')
    , _ = require('lodash')
    , jst = require('js-thumb')
    , CarouselView = require('./carousel')
    , vjs = require('videojs')
    , ShowView = View.extend({
        template: require('../../../templates/routes/media/show.hbs')
      , events: {
        }
      , initialize: function (options) {
          this.app = options.app;
          this.pageName = options.pageName;
          this.mediaType = options.mediaType;
          this.mediaId = options.mediaId;

          this.media = this.app.db.fetchModel(options.mediaType, options.mediaId);

          if(this.media.id) {
            this.media.fetch();
          }

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.media, 'change', this.render, this);

          this.fetchPage(options.pageName, function () {
            this.render();
          });
        }
      , beforeRender: function () {
          $('body').addClass('dark');
        }
      , beforeClose: function () {
          $('body').removeClass('dark');
        }
      , afterRender: function () {
        var self = this
          , mediaTemplateVars = this.media.templateVars()
          , carouselView = new CarouselView({
              app:this.app
            , pageName:this.pageName
            })
          , afterVideoLoad = function (err, elem, player) {
              if(err) {
                self.app.error(err);
              }
              else {
                player.on("ended",function () {
                  self.app.trigger("videoEnded",self.media);
                });
              }
            };

        this.appendSubview(carouselView, this.$('#carouselWrapper'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });

        //Activate VJS
        _.defer(function () {
          if(self.media
            && self.media.attributes
            && self.media.attributes.type.toLowerCase() === 'video'
            && self.media.attributes.status === 2) {

            self.$('#vid_placeholder').empty();

            jst.loadVideo(self.$('#vid_placeholder')[0]
              , {
                  vjs: {
                    autoplay: true
                  }
                , attributes: {
                    center: true
                  , resize: {
                      maxWidth: 960
                    , upscale: false
                    }
                  , width: self.media.attributes.width || 960
                  , height: self.media.attributes.height || 540
                  }
                , sources: [
                    {
                      src: mediaTemplateVars.hdUrl
                    , type: self.app.util.mime('video/mp4')
                    }
                  ]
                }
              , afterVideoLoad);
          }
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