(function () {
  var View = require('../../base')
    , Holder = require('../../../helpers/lib/holder.js')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , EditView = View.extend({
        template: require('../../../templates/routes/pages/edit.hbs')
      , events: {
          'submit': 'performSave'
        , 'click a.btn-danger':'performDelete'
        , 'click a.app':'handleAppLink'
        }
      , initialize: function (options) {
          this.app = options.app;
          this.page = this.app.db.createModel('page').set({
            name: 'Loading...'
          });
          var pages = this.app.db.fetchCollection('pages');

          this.listenTo(this.page, 'change', this.render, this);

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
              media.push(model.templateVars(safeName));
            });
          }

          return this.getContext({
            media: media
          , page: this.page.attributes
          });
        }
      , afterRender: function () {
          var self = this
            , navbar = new NavbarView({app:self.app})
            , footer = new FooterView({app:self.app});

          self.appendSubview(navbar, self.$('#header'));
          self.appendSubview(footer, self.$('#footer'));

          //Render all the subviews
          self.eachSubview(function (subview) {
            subview.render();
          });

          self.$('.sortable').sortable().bind('sortupdate', function() {
            self.readSortOrder.apply(self,arguments);
          });

          self.$(".switch").bootstrapSwitch();

          Holder.run();
        }

        //Tries to save the edited page
      , performSave: function(e) {
          var self = this;

          e.preventDefault();

          var name = this.$('input[name=name]').val()
            , isPublished = this.$("input[name=isPublished]").parent().hasClass("switch-on");

          this.page.save({
            userId:self.app.getUser().attributes.id,
            name:name,
            isPublished:isPublished
          }, {
            success:function() {

              // Don't forget to re-fetch the pages collection!
              self.app.db.fetchCollection('pages').fetch();

              self.app.setFlash('success', 'Page Saved!');
            },
            error: self.app.error
          });
        }

        //Tries to delete the page
      , performDelete: function(e) {
          e.preventDefault();
          e.stopPropagation();

          var self = this;

          var proceed = confirm("Are you sure you want to delete "+self.page.attributes.name+"?");
          if(proceed) {
            self.page.destroy({
              success:function() {
                //Reload pages
                self.app.db.fetchCollection('pages').remove(self.page);

                //Return to home
                self.app.navigate('',{trigger:true});
              },
              error:self.app.error
            });
          }
          else {
            //noop
            return false;
          }
        }

      , //Reads the sorting order of items on the page
        readSortOrder: function(e) {
          e.preventDefault();
          e.stopPropagation();

          var self = this;

          var items = self.$('.sortable').children();
          var models = [];
          var pageItems = [];
          items.each(function(index,elem) {
            var fModel = self.page.getMedia().get($(elem).attr("data-uuid"));
            models.push(fModel);
            pageItems.push({
              ID:fModel.attributes.id,
              NAME:fModel.attributes.name,
              TYPE:fModel.attributes.type,
              THUMB:fModel.attributes.thumbnailS3key
            });
          });

          self.page.getMedia().reset(models);
          self.page.set("items",pageItems);
          self.page.save({},{
            success:function() {
              self.app.setFlash('success', 'Page Saved!');
            },
            error:self.app.error
          });
        }
      });

  module.exports = EditView;
}());
