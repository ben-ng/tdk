(function () {
var _ = require('lodash')
  , $ = require('jquery-browserify')
  , path = require('path')
  , Backbone = require('backbone')
  
  /* Database Stuff */
  , db = require('./db')
  
  /* Routes */
  , Index = require('./routes/index')
  
  , App = Backbone.Router.extend({
    /**
    * Ctor
    */
    initialize: function (el) {
      /* Routes */
      this.route('', _.bind(Index, this));
      
      /* What element to render in? */
      el = el || document.body;
      this.el = el;
      this.$el = $(el);
      
      /* Start the database store */
      this.db = new db();
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