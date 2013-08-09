(function () {
  var Action = function (mediaType, mediaId, pageName) {
    var app = this
      , media
      , pages = this.db.fetchCollection('pages')
      , pageName = decodeURIComponent(pageName);

    pages.once('ready', function () {
      var foundPage = pages.find(function (page) {
        return page.attributes.name.toLowerCase() === pageName.toLowerCase();
      });

      if(foundPage) {
        media = app.db.fetchModel(mediaType, mediaId);

        media.once('ready', function () {
          var prompt = 'Are you sure you want to remove ' + media.attributes.name + ' from ' + foundPage.attributes.name + '?';

          if(confirm(prompt)) {
            foundPage.removeMedia(media.id, function (err) {
              app.navigate('page/' + pageName, {trigger:true});

              if(err) {
                app.error(err);
              }
            });
          }
          else {
            app.navigate('page/' + pageName, {trigger:true});
          }
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