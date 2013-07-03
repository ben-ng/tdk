(function () {
  var LoginView = require('../views/routes/login')
  , Login = function () {
    this.dispose();
    
    var view = new LoginView({app:this, el:this.el});
    
    this.show(view);
  };
  
  module.exports = Login;
}());