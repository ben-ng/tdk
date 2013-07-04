(function () {
  var LoginView = require('../views/routes/login')
  , Login = function () {
    var view = new LoginView({app:this});
    this.show(view);
  };

  module.exports = Login;
}());