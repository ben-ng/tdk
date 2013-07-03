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
      
      , getContext: function () {
          var additions = Array.prototype.slice.call(arguments)
            , context = _.clone(this.app.bootstrap.userVars);
          
          return _.extend(context, additions);
        }
      });
  
  module.exports = View;
}());
