(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , _ = require('lodash')
    , Backbone = require('../../../helpers/BackboneLoader')
    , IndexView = View.extend({
        template: require('../../../templates/routes/pages/create.hbs')
      , events: {
          'submit': 'performSave'
        , 'click a.app': 'handleAppLink'
        }
      , initialize: function (options) {
          this.app = options.app;

          this.model = this.app.db.createModel('page');

          this.listenTo(this.model,'invalid',function(model, err) {
            this.app.error(this.model, err);
          },this);

          this.listenTo(this.app.getUser(), 'change', this.render, this);

          this.toggleContact = _.bind(this.toggleContact, this);
        }
      , remove : function () {
          this.$('input[name=showContact]').parent().parent().on('switch-change', this.toggleContact);
          Backbone.View.prototype.remove.apply(this, arguments);
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

        //Focus on name input if it's empty
        inputElem = this.$('input[name=name]');
        if(inputElem.val().replace(/]w/, '') == '') {
          inputElem.val('').focus();
        }

        this.$(".switch").bootstrapSwitch();

        this.$('input[name=showContact]').parent().parent().on('switch-change', this.toggleContact);
      }
      , context: function () {
          var customization = this.app.getCustomization()
            , config;

          if(customization && customization.attributes && customization.attributes.config) {
            config = customization.attributes.config;

            return this.getContext({
              showContact: config.showContact ? config.showContact.value : false
            });
          }
          else {
            return this.getContext({showContact: false});
          }
        }
      , performSave: function(e) {
          var self = this;

          e.preventDefault();

          var name = this.$('input[name=name]').val();

          self.model.save({
            userId:self.app.getUser().id,
            name:name,
            // Make last priority!
            priority:self.app.db.fetchCollection('pages').length
          }, {
            success: function () {
              self.app.db.fetchCollection('pages').add(self.model);

              self.app.navigate('page/'+name,{trigger:true});
            }
          , error: self.app.error
          });
        }
      , toggleContact: function (e) {
          var self = this
            , showContact = this.$("input[name=showContact]").parent().hasClass("switch-on")
            , customization = this.app.getCustomization()
            , config = customization.attributes.config;

          e.stopPropagation();
          e.preventDefault();

          this.app.setFlash('info', 'Turning contact page ' + (showContact ? 'on' : 'off') + '...');

          if(!config.showContact) {
            config.showContact = {
              type: "boolean"
            , name: "Show Contact Page"
            , "default": false
            };
          }

          config.showContact.value = showContact;

          customization.set('config', config);

          customization.save({}, {
            success: function () {
              self.app.setFlash('success', 'Your contact page has been turned '+ (showContact ? 'on' : 'off'));

              // Redraw the navbar!
              self.render();
            }
          , error: self.app.error
          });
        }
      });

  module.exports = IndexView;
}());