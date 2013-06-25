(function () {
  /**
  * db (database, but not really)
  * 
  * Makes models and collections managable.
  */
  var db = function () {
    this.loadModel = function (modelName, id) {
      var model = require(path.join('./models/',modelName));
      
      return new model();
    };
  };
  
  module.exports = db;
}());