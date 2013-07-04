(function () {
  var IndexView = require('../views/routes/index')
  , Index = function () {
    var view = new IndexView({app:this});
    this.show(view);
  };

  module.exports = Index;
}());