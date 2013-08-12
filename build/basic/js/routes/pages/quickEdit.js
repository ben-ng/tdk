(function () {
  var Action = function (pageName, action) {
    var app = this
      , pages = this.db.fetchCollection('pages')
      , pageName = decodeURIComponent(pageName);

    pages.once('ready', function () {
      var foundPage = pages.find(function (page) {
        return page.attributes.name.toLowerCase() === pageName.toLowerCase();
      });

      if(foundPage) {
        switch(action) {
          case 'makePublic':
            foundPage.set('isPublished', true);
          break;
          case 'makePrivate':
            foundPage.set('isPublished', false);
          break;
        }

        foundPage.save({}, {
          success: function (model, resp) {
            app.navigate('page/' + pageName, {trigger:true});
          }
        , error: app.error
        });
      }
      else {
        app.navigate('page/' + pageName, {trigger:true});
        app.error('Error 404: The page could not be found');
      }
    });
  };

  module.exports = Action;
}());