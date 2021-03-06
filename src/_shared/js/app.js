(function () {
var _ = require('lodash')
  , $ = require('./helpers/JqueryLoader')
  , jst = require('js-thumb')
  , path = require('path')
  , Backbone = require('./helpers/BackboneLoader.js')
  , Messenger = require('./helpers/lib/messenger.js')

  /* Database Stuff */
  , db = require('./helpers/db')

  /* Routes */
  , Routes = {
      '': require('./routes/index')
    , 'login': require('./routes/login')
    , 'logout': require('./routes/logout')
    , 'createPage': require('./routes/pages/create')
    , 'page/:name': require('./routes/pages/show')
    , 'page/:name/edit': require('./routes/pages/edit')
    , 'page/:name/edit/:action/immediately': require('./routes/pages/quickEdit')
    , 'reorder': require('./routes/pages/reorder')
    , 'page/:name/addMedia': require('./routes/media/add')
    , 'page/:name/pickMedia': require('./routes/media/pick')
    , 'review': require('./routes/review')
    , 'page/:name/:type/:id': require('./routes/media/show')
    , 'media/:type/:id/edit': require('./routes/media/edit')
    , 'media/:type/:id/remove/:page': require('./routes/media/remove')
    , 'contact': require('./routes/contact')
    }
  , App = Backbone.Router.extend({
    /**
    * Constructs a new app
    */
    initialize: function (el, config) {
      var unprocessed
        , unprocessedTimeout;

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

      /* Listen to user changes */
      this.listenTo(this.getUser(), 'change', function () {
        // If a userId is defined in the bootstrap, make sure
        // that this user matches up!
        if(this.bootstrap.userId
          && this.getUser().attributes.token
          && this.getUser().id !== this.bootstrap.userId) {
            // Redirect to the logout page!
            this.navigate('logout',{trigger:true});
            this.setFlash('info', 'You have been logged out because this is not your portfolio.');
        }
      }, this);

      /* Listen to unprocessed upload changes */
      unprocessed = this.db.fetchCollection('unprocessedUploads');

      this.listenTo(unprocessed, 'ready add change remove sync reset', function () {
        if(unprocessed.length > 0) {
          unprocessedTimeout = setTimeout(function () {
            clearTimeout(unprocessedTimeout);
            unprocessed.fetch();
          }, 3000);
        }
        else {
          clearTimeout(unprocessedTimeout);
        }
      });

      this.error = _.bind(this.error, this);
      this.setFlash = _.bind(this.setFlash, this);
      this.clearFlash = _.bind(this.clearFlash, this);

      window.onresize = jst.resizeVideos;

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
    /*
    * The error function has to handle three possible scenarios:
    *   error(model, err)
    *   error(jqXHR, textStatus, errorThrown)
    *   error(err)
    */
  , error: function (model, err) {
      console.log(arguments);

      // Third Scenario
      if (!err) {
        err = model;
      }
      else if (err.statusText === 'timeout') {
        err = 'The request timed out';
      }
      // Second scenario(s)?
      else if (model.responseText) {
        err = model.responseText;
      }
      else if (err.responseText) {
        err = err.responseText;
      }

      var self = this
        , errToShow = err
        , buff = "";

      if(typeof errToShow == 'string') {
        try {
          errToShow = JSON.parse(errToShow);
        }
        catch (e) {
          // Well, guess it isn't JSON then!
        }
      }

      // Handle errors thrown through respondWith
      if(errToShow.message) {
        errToShow = errToShow.message;
      }

      if(errToShow == null) {
        errToShow = "Unknown (Null) Error";
      }

      // If it's an error 403, treat it specially
      if(parseInt(errToShow, 10) === 403) {
        this.logoutFromInactivity();
      }
      else if(typeof errToShow === 'object') {
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
      var custId
        , model;

      // If there is a bootstrapped customization ID, use that
      if(this.bootstrap && this.bootstrap.customizationId) {
        custId = this.bootstrap.customizationId;

        model = this.db.fetchModel('customization', custId);
      }
      // Otherwise, try for a logged in user's customization ID
      else if (this.isLoggedIn()) {
        custId = this.getUser().attributes.customization.id

        model = this.db.fetchModel('customization', custId);

        // We can bootstrap the cust model with stuff from the user
        if(this.getUser().attributes.customization) {
          model.set(this.getUser().attributes.customization);
        }
      }

      if(custId) {
        return model;
      }
      else {
        return false;
      }
    }

  , getUserVars: function () {
      var customization = this.getCustomization();

      if(!this.isLoggedIn()) {
        return this.bootstrap.userVars;
      }
      else if(!customization) {
        return this.bootstrap.userVars;
      }
      else {
        return customization.attributes.config;
      }
    }

  , logoutFromInactivity: function () {
      var self = this;

      this.navigate('logout', {trigger: true});

      // Need to defer as logout will redirect to homepage
      setTimeout(function () {
        self.setFlash('info', 'You were logged out due to inactivity');
      }, 1000);
    }
  });

  module.exports = App;
}());
