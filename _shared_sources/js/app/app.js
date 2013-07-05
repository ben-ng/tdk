(function () {
var _ = require('lodash')
  , $ = require('jquery-browserify')
  , path = require('path')
  , Backbone = require('./helpers/CorsBackbone.js')
  , Messenger = require('./helpers/messenger.js')

  /* Database Stuff */
  , db = require('./helpers/db')

  /* Routes */
  , Routes = {
      '': require('./routes/index')
    , 'login': require('./routes/login')
    , 'logout': require('./routes/logout')
    , 'createPage': require('./routes/pages/create')
    , 'page/:name': require('./routes/pages/show')
    , 'page/:name/addMedia': require('./routes/media/add')
    , 'review': require('./routes/review')
    , 'media/:type/:id/edit': require('./routes/media/edit')
    }
  , App = Backbone.Router.extend({
    /**
    * Constructs a new app
    */
    initialize: function (el, config) {
      /* Routes */
      _.each(Routes, function (func, route) {
        this.route(route, _.bind(func, this));
      }, this);

      /* What element to render in? */
      el = el || document.body;
      this.el = el;
      this.$el = $(el);

      /* Start the database store */
      this.db = new db(this);

      /* Load configuration */
      this.config = _.clone(require('./config/config.js'));

      /* Load utilities */
      this.util = require('./helpers/util.js')(this.config);

      /* Load messenger */
      this.messenger = new Messenger(null, this.config.s3prefix, 'thumbnailer');

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
      // Clobber all the event bindings RAWR
      if(this.currentView) {
        this.currentView.close();
        this.currentView = null;
      }

      this.currentView = view;
      view.render();
      this.$el.append(view.$el);

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
  , error: function (model, err) {
      if(!err) {
        err = model;
      }

      var self = this
        , errToShow = err
        , buff = "";

      if(errToShow == null) {
        errToShow = "Unknown (Null) Error";
      }

      if(typeof errToShow === 'object') {
        buff = [];

        /*
        * Error arrays come in the format
        * [{attr:<String>,message:<String>}, ...]
        */
        if(errToShow instanceof Array) {
          for(var i=0, ii=errToShow.length; i<ii; i++) {
            buff.push(self.util.ucfirst(errToShow[i].attr)
                    + ": "
                    + self.util.ucfirst(errToShow[i].message));
          }
        }
        //Probably a filepicker error then
        else if(errToShow.toString) {
          buff = [errToShow.toString()];
        }
        /*
        * Error objects come in the format
        * {attr:<message String>, ...}
        */
        else {
          for(var key in errToShow) {
            buff.push(self.util.ucfirst(key)
                    + ": "
                    + self.util.ucfirst(errToShow[key]));
          }
        }

        buff = buff.join(",");
      }
      else {
        buff += errToShow;
      }

      this.setFlash('error', buff);
    }

    /*
    * The One True User (tm) convenience function
    * better than this.app.db.fetchModel('user') all over the place.
    *
    * This is a method so that we can rely on the `ready` event
    * after a view or something fetches the user.
    */
  , getUser: function () { return this.db.fetchModel('user'); }

  , getCustomization: function () {
      if(this.isLoggedIn()) {
        return this.db.createModel('customization').set(this.getUser().attributes.customization);
      }
      else {
        return false;
      }
    }

  , getUserVars: function () {
      var customization = this.getCustomization();

      if(!customization) {
        return this.bootstrap.userVars;
      }
      else {
        return customization.attributes.config;
      }
    }
  });

  module.exports = App;
}());
