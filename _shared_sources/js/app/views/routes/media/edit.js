(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , IndexView = View.extend({
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

          this.media = this.app.db.fetchModel(options.mediaType, options.mediaId);

          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.media, 'change', this.render, this);
          this.renderOnReady(this.media);
        }
      , afterRender: function () {
        var inputElem;

        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

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
        //Tries to save the edited media
      , performSave: function(e) {
          var self = this;

          e.preventDefault();

          var name = this.$('input[name=name]').val();
          var attribs = this.$('input[name=attribs]').val().split(",");

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

          this.media.pickThumbnail();
        }
        //Tries to pick a new thumbnail
      , performCrop: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.trigger("captureThumbnail");
        }
        //Tries to capture a frame from the video
      , performCapture: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.app.trigger("captureThumbnail");
        }
      });

  module.exports = IndexView;
}());