(function () {
  var View = require('../base')
    , $ = require('../../helpers/JqueryLoader')
    , NavbarView = require('../layout/navbar.js')
    , FooterView = require('../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../templates/routes/contact.hbs')
      , initialize: function (options) {
          this.app = options.app;
        }
      , events: {
          'submit': 'send'
        }
      , afterRender: function () {
        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        navbar.remove();
        footer.remove();

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
        // Persist form contents incase of failure
      , nameVal: ''
      , emailVal: ''
      , messageVal: ''
      , context: function () {
          return this.getContext({
            nameVal: this.nameVal
          , emailVal: this.emailVal
          , messageVal: this.messageVal
          });
        }
      , send: function (e) {
          e.preventDefault();
          e.stopPropagation();

          var self = this
            , user = self.app.getUser();

          self.nameVal = self.$('form input[name="name"]').val()
          self.emailVal = self.$('form input[name="email"]').val()
          self.messageVal = self.$('form textarea').val();

          self.app.clearFlash();
          self.app.setFlash('info', 'Sending message...');
          self.$('form button').button('loading');

          user.once('ready', function () {
            $.ajax({
              url: self.app.config.baseUrl + '/users/contact.json'
            , success: function (data) {
                if(data.error) {
                  self.app.error(data.error);
                }
                else {
                  self.app.setFlash('success', 'Message sent!');
                }
              }
            , error: function (jqXHR, textStatus, errorThrown) {
                self.app.error(errorThrown);
              }
            , complete: function () {
                self.$('form button').button('reset');
                self.render(); // FIXME: Stupid flash messages won't render
              }
            , data: {
                name: self.nameVal
              , email: self.emailVal
              , message: self.messageVal
              , id: user.id
              }
            , dataType: 'json'
            , timeout: 20000
            , type: 'POST'
            });
          });
        }
      });

  module.exports = IndexView;
}());
