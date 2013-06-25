(function () {
  var IndexView = require('../views/index')
  , Index = function () {
    var view = new IndexView({el:this.el});
    
    view.render();
  };
  
  module.exports = Index;
}());