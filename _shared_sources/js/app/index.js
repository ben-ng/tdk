window.onload = function () {
  /**
  * Main app
  */
  
  var App = require('./app');
  
  window.app = new App(document.getElementById("app"));
  window.app.start();
};