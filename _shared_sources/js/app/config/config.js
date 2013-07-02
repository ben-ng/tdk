(function () {
  var config = {};
  
  // APP CONFIG
  if(process.env.CI || process.env.NODE_ENV === 'staging') {
    config.baseUrl = "http://staging.toolkitt.com";
  }
  else if(process.env.NODE_ENV === 'development') {
    config.baseUrl = "http://localdev.toolkitt.com";
  }
  else {
    config.baseUrl = 'http://toolkitt.com';
  }
  
  module.exports = config;
}());