(function () {
  var View = require('../../views/routes/media/edit')
  , Action = function (mediaType, mediaId) {
    var view = new View({app:this, mediaType: mediaType, mediaId: mediaId});
    this.show(view);
  };

  module.exports = Action;
}());