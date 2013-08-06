(function() {
  var Backbone = require('backbone')
    , _ = require('lodash')
    , $ = require('./JqueryLoader.js')
    , proxiedSync = Backbone.sync;

  Backbone.$ = $;

  Backbone.sync = function(method, model, options) {
    options = options || {};

    options.attrs = options.attrs || _.clone(model.toJSON());
    options.timeout = options.timeout || 20000;
    options.parse = options.parse || true;

    if (model.urlRoot && model.methodUrl) {
      options.url = model.methodUrl(method.toLowerCase());
    }
    else if(typeof model.url === 'function') {
      options.url = model.url();
    }
    else if(model.url) {
      options.url = model.url;
    }

    if (!options.crossDomain) {
      options.crossDomain = true;
    }

    if (!options.xhrFields) {
      options.xhrFields = {withCredentials:true};
    }

    /**
    * Proxy the success function if the user defined one
    */
    if(options.success) {
      var proxiedSuccess = options.success;

      options.success = function(data, textStatus, jqXHR) {
        var errors;

        if(data[model.name] && data[model.name].errors) {
          errors = data[model.name].errors;
        }
        else if(data.error) {
          errors = data.error;
        }
        else if(data.errors) {
          errors = data.errors;
        }

        if(errors) {

          /**
          * Delegates to the error handler if one is defined
          */
          if(options.error) {
            var sendToErrorhandler = function() {
              options.error({responseText:JSON.stringify({errors:errors})});
            };

            //If there was an error, we need to restore the last known "good" state of the model

            //Avoid going into an infinite loop if read produces an error
            if(method !== "read") {
              model.fetch({
                success: function() {
                  sendToErrorhandler();
                },
                error: function() {
                  sendToErrorhandler();
                }
              });
            }
            else {
              sendToErrorhandler();
            }
          }
          else {
            return proxiedSuccess(data, textStatus, jqXHR);
          }
        }
        else {
          return proxiedSuccess(data, textStatus, jqXHR);
        }
      }
    }

    return proxiedSync(method, model, options);
  };

  module.exports = Backbone;
}());