(function () {
  /* Old, "show index page" action
  var View = require('../views/routes/index')
  , Action = function () {
    var view = new View({app:this});
    this.show(view);
  };
  */

  var IndexView = require('../views/routes/index')
    , NoPagesView = require('../views/errors/no_pages')
    , Action = function () {
      // What to do.. what to do..
      var self = this
        , pages = this.db.fetchCollection('pages')
        , user = this.getUser()
          // Two things to wait for ready
        , readyCount = 2
          // Called after pages collection and user is ready
        , ready = function () {
            var noPagesView = new NoPagesView({app:self})
              , lowestPriorityPage;

            // Are we logged in?
            if(self.isLoggedIn()) {
              lowestPriorityPage = pages.sort().at(0);
            }
            else {
              lowestPriorityPage = pages.sort().findWhere({isPublished: true});
            }

            // Send to that page view
            if(lowestPriorityPage) {
              self.navigate('page/' + encodeURIComponent(lowestPriorityPage.attributes.name), {trigger: true});
            }
            else {
              // No available pages? Check if logged in
              if(self.isLoggedIn()) {
                // Direct to page creation
                self.navigate('createPage', {trigger: true});
              }
              else {
                // Nope, show the no pages view
                self.show(noPagesView);
              }
            }
          }
          // Called when an item is ready
        , onReady = function () {
            readyCount--;

            if(readyCount === 0) {
              ready();
            }
          };

      pages.once('ready', onReady);
      user.once('ready', onReady);
    };

  module.exports = Action;
}());