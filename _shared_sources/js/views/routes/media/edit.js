(function () {
  var View = require('../../base')
    , _ = require('lodash')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , ThumbView = require('../../routes/media/thumb.js')
    , EditView = View.extend({
        template: require('../../../templates/routes/media/edit.hbs')
      , events: {
          'submit':'performSave'
        , 'click a.btn-danger':'performDelete'
        , 'click a.upload':'performPick'
        , 'click a.crop':'performCrop'
        , 'click a.capture':'performCapture'
        , 'click a.app': 'handleAppLink'
        }
      , initialize: function (options) {
          this.app = options.app;
          this.mediaType = options.mediaType;
          this.mediaId = options.mediaId;

          this.media = this.app.db.fetchModel(options.mediaType, options.mediaId);

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.media, 'change', this.render, this);

          this.listenTo(this.media, 'invalid', function () {
            this.app.error(this.media.validationError);
          }, this);

          this.renderOnReady(this.media);
        }
      , afterRender: function () {
        var inputElem;

        var navbar = new NavbarView({app:this.app})
          , thumber = new ThumbView({
              app:this.app
            , mediaType:this.mediaType
            , mediaId:this.mediaId
            })
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));

        if(this.media.attributes && this.media.attributes.status === 2) {
          this.appendSubview(thumber, this.$('#thumber'));
        }

        this.appendSubview(footer, this.$('#footer'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });

        //Pretty stupid, but the tags plugin won't work until the thing
        //is actually on the DOM... so we have to defer here
        _.defer(function () {
          // Wipe out all previous instances
          this.$('div.tagsinput').remove();

          // Enhance
          this.$("input[name=attribs]").tagsInput();

          this.$("legend span").popover({placement:'right', trigger:'hover', html:true});
        }, this);

          this.$('#useOriginalButton').button('reset');
          this.$('#useCaptureButton').button('reset');
      }
      , context: function () {
          return this.getContext({
            media: this.media.templateVars()
          , isEncoded: this.media.attributes.status === 2
          });
        }
        // Just sets the properties immediately
      , readInput : function (e) {
          var self = this;

          if(e) {
            e.preventDefault();
          }

          this.media.set('name', this.$('input[name=name]').val());
          this.media.set('attribs', this.$('input[name=attribs]').val().split(","));
        }
        //Tries to save the edited media
      , performSave: function(e) {
          var self = this;

          e.preventDefault();

          var name = this.$('input[name=name]').val();
          var attribs = this.$('input[name=attribs]').val().split(",");

          this.app.clearFlash();

          this.media.save({
            userId: self.app.getUser().attributes.id,
            name: name,
            attribs: attribs
          }, {
            success: function () {
              self.app.db.fetchCollection('unprocessedUploads').fetch({
                success: function () {
                  var ucedType = self.media.attributes.type.charAt(0).toUpperCase()
                  ucedType += self.media.attributes.type.substr(1);

                  self.app.setFlash('success', ucedType +' Saved!');
                },
                error: self.app.error
              });
            },
            error: self.app.error
          });
        }
        //Tries to delete the media
      , performDelete: function(e) {
          e.preventDefault();
          e.stopPropagation();

          var self = this;

          var proceed = confirm("Are you sure you want to delete "+self.media.attributes.name+"?");
          if(proceed) {
            filepicker.remove(self.media.fpfile(), {
              policy: self.app.getUser().attributes.policy,
              signature: self.app.getUser().attributes.signature
            }, function() {
              self.media.destroy({
                success: function () {
                  //Return to home
                  self.app.navigate('',{trigger:true});
                },
                error: self.app.error
              });
            },
            self.app.error);
          }
          else {
            //noop
            return false;
          }
        }
        //Tries to pick a new thumbnail
      , performPick: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.clearFlash();

          this.media.pickThumbnail();
        }
        //Tries to pick a new thumbnail
      , performCrop: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.clearFlash();

          this.app.trigger("captureThumbnail");
          this.$('#useOriginalButton').button('loading');
        }
        //Tries to capture a frame from the video
      , performCapture: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.clearFlash();

          this.app.trigger("captureThumbnail", this.mediaId);
          this.$('#useCaptureButton').button('loading');
        }
      });

  module.exports = EditView;
}());