(function () {
  var IndexView = require('../views/routes/index')
  , Index = function () {
    this.dispose();
    
    var view = new IndexView({app:this, el:this.el});
    
    this.show(view);
  };
  
  module.exports = Index;
}());