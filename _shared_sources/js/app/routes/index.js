(function () {
  var IndexView = require('../views/index')
  , Index = function () {
    var view = new IndexView({app:this, el:this.el});
    
    view.render();
  };
  
  module.exports = Index;
}());