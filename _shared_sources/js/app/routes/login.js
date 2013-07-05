(function () {
  var View = require('../views/routes/login')
  , Action = function () {
    var view = new View({app:this});
    this.show(view);
  };

  module.exports = Action;
}());
