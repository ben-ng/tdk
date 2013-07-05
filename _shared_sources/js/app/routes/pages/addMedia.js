(function () {
  var View = require('../../views/routes/pages/addMedia')
  , Action = function (pageName) {
    var view = new View({app:this, pageName: pageName});
    this.show(view);
  };

  module.exports = Action;
}());