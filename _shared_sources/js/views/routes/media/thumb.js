(function () {
  var View = require('../../base')
    , ThumbView = View.extend({
        template: require('../../../templates/routes/media/thumb.hbs')
      , initialize: function (options) {
          this.app = options.app;

          this.media = this.app.db.fetchModel(options.mediaType, options.mediaId);

          this.listenTo(this.media,'change',this.render,this);
          this.listenTo(this.app, 'iframeResize', this.resizeIframe ,this);
          this.listenTo(this.app, 'thumbnailCaptured', this.saveThumbnail ,this);
          this.listenTo(this.app, 'captureThumbnail', this.captureThumbnail ,this);

          this.renderOnReady(this.media);
        }
      , context: function () {
          var attrs = this.media.templateVars()
            , opts = {
                media: {
                  sources: []
                , attributes: {
                    id: "media_" + this.app.util.uuid(10)
                  , resize: true
                  }
                }
              , dimensions: this.app.config.thumbnailDims
              , domain: document.domain + (window.location.port===80?'':':'+window.location.port)
              };

          if(this.media.attributes.type.toLowerCase() === 'video') {
            opts.media.sources = [
              {
                src: attrs.hdUrl
              , type: this.app.util.mime('video/mp4')
              }
            ];
          }
          else {
            opts.media.sources = [
              {
                src: attrs.url
              , type: this.app.util.mime(attrs.mimeType)
              }
            ];
          }

          return this.getContext({
            media: attrs
          , thumberUrl: attrs.s3key ? this.app.config.thumberUrl + "#" + encodeURIComponent(JSON.stringify(opts)) : null
          });
        }
      , afterRender: function () {
          this.app.messenger.targetFrame = this.$el.find("iframe")[0];
        }
      , resizeIframe: function (height) {
          this.$el.find("iframe").attr("height", parseInt(height)+60);
        }
      , saveThumbnail: function (base64data) {
          this.app.setFlash('info', 'Please Wait, Saving Image...');
        }
      , captureThumbnail: function () {
          var self = this;

          //Send a message
          self.app.messenger.send("capture",[],function (data) {
            self.media.useThumbnail(data.substring(data.indexOf(",")+1));
          });
        }
      });

  module.exports = ThumbView;
}());