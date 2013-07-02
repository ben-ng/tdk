(function () {
var _ = require('lodash')
  , $ = require('jquery-browserify')
  , path = require('path')
  , Backbone = require('./helpers/CorsBackbone.js')
  
  /* Database Stuff */
  , db = require('./db')
  
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
      
      /* Load configuration */
      this.config = _.clone(require('./config/config.js'));
    }
    
    /**
    * Starts the app
    */
  , start: function () {
      Backbone.history.start();
    }
  });
  
  module.exports = App;
}());