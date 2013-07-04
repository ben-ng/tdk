(function () {
  var PageCreateView = require('../../views/routes/pages/create')
  , PageCreate = function () {
    var view = new PageCreateView({app:this});
    this.show(view);
  };

  module.exports = PageCreate;
}());