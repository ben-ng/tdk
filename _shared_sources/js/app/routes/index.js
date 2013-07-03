(function () {
  var IndexView = require('../views/routes/index')
  , Index = function () {
    var view = new IndexView({app:this, el:this.el});
    
    view.render();
  };
  
  module.exports = Index;
}());