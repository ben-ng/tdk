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
                
                if(thingCount === 0) {
                  self.render();
                }
              };
          
          _.each(things, function (thing) {
            thing.once('ready', next, self);
          });
        }
      
      // Nice function that mixes in custom attrs to the standard context
      , getContext: function (additions) {
          var userAdditions = additions || {}
            , ourAdditions = {
              isLoggedIn: this.app.isLoggedIn()
            }
            , context = _.clone(this.app.bootstrap.userVars);
          
          return _.extend(context, ourAdditions, userAdditions);
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
      });
  
  module.exports = View;
}());
