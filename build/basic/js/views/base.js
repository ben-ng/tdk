(function () {
  var Ribcage = require('ribcage-view')
    , _ = require('lodash')
    , View = Ribcage.extend({
        /*
        * Intended to be use in the initializer as a simple way to
        * trigger a render after dependent models and collections
        * have loaded from the server or cache
        *
        * Usage: this.renderOnReady(myModelA,myCollectionA,myCollectionB...);
        *   Will render the view after all the models and collections have been loaded
        */
        renderOnReady: function () {
          var things = Array.prototype.slice.call(arguments)
            , self = this
            , thingCount = things.length
            , next = function () {
                thingCount--;

                if(thingCount<0) {
                  self.render();
                }
              };

          _.each(things, function (thing) {
            thing.once('ready', next, thing);
          });

          next();
        }

        /*
        * Fetches a page, assigns it to this.page, listens to it and renders on change
        * query [String] - Page name
        * cb [Function] - function (err, page)
        */
      , fetchPage: function (query, cb) {
          var self = this
            , errmsg = 'Error 404: The page could not be found';

          query = query.toLowerCase();

          self.page = this.app.db.createModel('page').set({
              name: 'Loading...'
            });
          self.pages = this.app.db.fetchCollection('pages');

          // First make sure we can load the pages collection
          self.pages.once('ready', function () {
            var err
              , foundPage = self.pages.find(function (page) {
                return page.attributes.name.toLowerCase() === query.toLowerCase();
              });

            if(foundPage) {
              self.page = foundPage;
              self.listenTo(self.page, 'change', self.render, self);
            }
            else {
              self.page.set({name:'404'});
              self.app.error(errmsg);
              err = new Error(errmsg);
            }

            cb.call(self, err, self.page);
          });
        }

      // Nice function that mixes in custom attrs to the standard context
      , getContext: function (additions) {
          var userAdditions = additions || {}
            , ourAdditions = {
              isLoggedIn: this.app.isLoggedIn()
            , flash: _.clone(this.app.flash)
            , debug: (this.app.bootstrap.debug || process.env.NODE_ENV !== 'production') ? true : false
            }
            , context = this.app.getUserVars();

          return _.extend({}, context, ourAdditions, userAdditions);
        }

      // By default just return the standard context
      , context: function () {
          return this.getContext();
        }

      // Used by a.app links
      , handleAppLink: function (e) {
          this.app.handleAppLink(e);
        }

      // App links with a class of `app` are treated as routes
      , events: {
          'click a.app': 'handleAppLink'
        }

      // Clean up subviews in beforeRender as we'll add new
      // ones in afterRender
      , beforeRender: function () {
          //Close all the subviews
          this.eachSubview(function (subview) {
            subview.close();
          });
          this.$el.empty();
        }
      });

  module.exports = View;
}());
