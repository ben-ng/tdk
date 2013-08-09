(function () {
  var View = require('../views/routes/contact')
  , Action = function () {
      var view = new View({app:this});
      this.show(view);
    };

  module.exports = Action;
}());
