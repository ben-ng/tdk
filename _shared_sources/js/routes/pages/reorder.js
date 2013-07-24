(function () {
  var View = require('../../views/routes/pages/reorder')
  , Action = function () {
    var view = new View({app:this});
    this.show(view);
  };

  module.exports = Action;
}());