(function () {
  var View = require('../base')
    , NavbarView = require('../layout/navbar.js')
    , FooterView = require('../layout/footer.js')
    , LoginView = View.extend({
        template: require('../../templates/routes/login.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.user = this.app.getUser();

          this.listenTo(this.user, 'change', this.render, this);

          // Checks if the right user was logged in
          this.listenTo(this.user, 'change', function () {
            // If a userId is defined in the bootstrap, make sure
            // that this user matches up!
            if(this.app.bootstrap.userId
              && this.user.attributes.token
              && this.user.id !== this.app.bootstrap.userId) {
                // Redirect to the logout page!
                this.app.setFlash('error', 'Sorry, you can\'t log in here!');

                // Wipe it out!
                this.app.getUser().set({
                  id: null
                , username: null
                , password: null
                , token: false
                , policy: null
                , signature: null
                , path: null
                , customization: {}
                });
            }
          }, this);

          this.renderOnReady(this.user);
        }
      , afterRender: function () {
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
          return this.getContext({user:this.user.attributes});
        }
      , events: {
          'submit': 'login'
        , 'click a.app': 'handleAppLink'
        , 'click a.provisionTestAccount': 'provisionTestAccount'
        }
        //Tries to log the user in
      , login: function(e) {
          e.preventDefault();
          e.stopPropagation();

          var username = this.$('input[name=username]').val();
          var password = this.$('input[name=password]').val();

          this.user.set({username:username,password:password}).save();
        }
        //Tries to provision a testing account
      , provisionTestAccount: function(e) {
          e.preventDefault();
          e.stopPropagation();

          this.user.set({id: 'test'}).save();
        }
      });

  module.exports = LoginView;
}());
