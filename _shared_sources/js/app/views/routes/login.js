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
          
          this.renderOnReady(this.user);
        }
      , afterRender: function () {
        this.navbar = this.navbar || new NavbarView({app:this.app});
        this.footer = this.footer || new FooterView({app:this.app});
        
        this.navbar.remove();
        this.footer.remove();
        
        this.appendSubview(this.navbar, this.$('#header'));
        this.appendSubview(this.footer, this.$('#footer'));
        
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
        }
        //Tries to log the user in
      , login: function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('triggered!');
          
          var username = this.$('input[name=username]').val();
          var password = this.$('input[name=password]').val();
          
          this.user.set({username:username,password:password}).save();
        }
      });
  
  module.exports = LoginView;
}());
