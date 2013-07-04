(function () {
var _ = require('lodash')
  , $ = require('jquery-browserify')
  , path = require('path')
  , Backbone = require('./helpers/CorsBackbone.js')
  
  /* Database Stuff */
  , db = require('./helpers/db')
  
  /* Routes */
  , Index = require('./routes/index')
  , Login = require('./routes/login')
  , Logout = require('./routes/logout')
  
  , App = Backbone.Router.extend({
    /**
    * Constructs a new app
    */
    initialize: function (el, config) {
      /* Routes */
      this.route('', _.bind(Index, this));
      this.route('login', _.bind(Login, this));
      this.route('logout', _.bind(Logout, this));
      
      /* What element to render in? */
      el = el || document.body;
      this.el = el;
      this.$el = $(el);
      
      /* Start the database store */
      this.db = new db(this);
      
      /*
      * The One True User (tm) convenience function
      * better than this.app.db.fetchModel('user') all over the place.
      * 
      * This is a method so that we can rely on the `ready` event
      * after a view or something fetches the user.
      */
      this.getUser = function () { return this.db.fetchModel('user'); };
      
      /* Load configuration */
      this.config = _.clone(require('./config/config.js'));
      
      /* Load utilities */
      this.util = _.clone(require('./helpers/util.js'));
      
      return this;
    }
    
    /**
    * Starts the app
    */
  , start: function (bootstrap) {
      this.bootstrap = bootstrap || {};
      
      Backbone.history.start();
      
      return this;
    }
    
    /**
    * Handles a link that is really a route
    */
  , handleAppLink: function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var target = e.target;
      
      while(target.pathname == null) {
        target = target.parentElement;
      }
      
      this.navigate(target.pathname, {trigger:true});
      
      return this;
    }
    
    /**
    * Returns true if logged in
    */
  , isLoggedIn: function() {
      return this.getUser().attributes && this.getUser().attributes.token;
    }
    
    /**
    * Shows a view, does the dirty work of cleaning up
    * old events so they don't fire repeatedly etc
    */
  , show: function (view) {
      this.currentView = view;
      view.render();
      
      return this;
    }
    
    /**
    * Disposes of the active view
    */
  , dispose: function () {
      if(this.currentView) {
        this.currentView.undelegateEvents();
        this.currentView.$el.removeData().unbind(); 
        this.currentView.$el.empty();
        this.currentView = null;
      }
      
      return this;
    }
    
    /**
    * Shows a flash message
    */
  , flash: null
  , setFlash: function (type, message) {
      if(!type) {
        type='info';
      }
      
      this.flash = {message: message, type: type};
      
      this.trigger('flash');
      
      //Clear the flash on the next route change
      this.listenToOnce(this,"route",function(route, router, params) {
        this.clearFlash();
      });
      
      return this;
    }
    /**
    * Clears the flash message
    */
  , clearFlash: function () {
      this.flash=null;
      
      this.trigger('flash');
      
      return this;
    }
  });
  
  module.exports = App;
}());
