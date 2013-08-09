(function () {
  var View = require('../../views/routes/media/add')
  , Action = function (pageName) {
    var view = new View({app:this, pageName: pageName});
    this.show(view);
  };

  module.exports = Action;
}());