(function () {
var _ = require('lodash')
  , $ = require('jquery-browserify')
  , path = require('path')
  , Backbone = require('./helpers/CorsBackbone.js')
  
  /* Database Stuff */
  , db = require('./helpers/db')
  
  /* Routes */
  , Index = require('./routes/index')
  
  , App = Backbone.Router.extend({
    /**
    * Ctor
    */
    initialize: function (el, config) {
      /* Routes */
      this.route('', _.bind(Index, this));
      
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
    }
  });
  
  module.exports = App;
}());
