(function () {
  var View = require('../../views/routes/media/show')
  , Action = function (pageName, mediaType, mediaId) {
    var view = new View({
      app:this
    , mediaType: mediaType
    , mediaId: mediaId
    , pageName: pageName
    });
    this.show(view);
  };

  module.exports = Action;
}());