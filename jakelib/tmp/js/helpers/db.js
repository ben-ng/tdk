(function () {
  var path = require('path')
    , _ = require('lodash')
    , delay = 1

  /**
  * Model definitions
  */
  , models = {
      'user': require('../models/user')
    , 'image': require('../models/image')
    , 'video': require('../models/video')
    , 'page': require('../models/page')
    , 'customization': require('../models/customization')
    }

  /**
  * Collection definitions
  */
  , collections = {
      'pagemedia': require('../collections/pageMedia')
    , 'pages': require('../collections/pages')
    , 'unprocesseduploads': require('../collections/unprocessedUploads')
    , 'images': require('../collections/images')
    , 'videos': require('../collections/videos')
    }

  /**
  * db: database, but not really, just an interface (:
  *
  * Makes models and collections not stupid
  */
  , db = function (App) {
    var self = this;

    this.cache = {};

    /**
    * Creates a new model
    * @param {string} modelName - The name of the model you want (e.g. 'posts')
    */
    this.createModel = function (modelName, attrs) {
      modelName = modelName.toLowerCase();
      attrs = attrs || {};

      if(_.find(models, function (v,key) { return key === modelName;})) {
        return new models[modelName](attrs, {app:App});
      }
      else {
        throw new Error('Cannot find Model "' + modelName + '"');
      }
    };

    /**
    * Creates a new collection
    * @param {string} collectionName - The name of the collection you want (e.g. 'posts')
    * @param {object} options - The options to supply the constructor
    */
    this.createCollection = function (collectionName, attributes) {
      collectionName = collectionName.toLowerCase();

      attributes = attributes || {};
      attributes = _.clone(attributes);
      attributes.app = App;

      if(_.find(collections, function (v,key) { return key === collectionName;})) {
        return new collections[collectionName]([], attributes);
      }
      else {
        throw new Error('Cannot find Collection "' + collectionName + '"');
      }
    };

    /**
    * Fetches a model by ID
    * Under the surface, this will try to use the local cache if possible
    * @param {string} modelName - The name of the model you want (e.g. 'posts')
    * @param {string} [id] - The id of the model you want
    * @param {Array} [attributes] - The attributes to set (will skip fetch if defined)
    */
    this.fetchModel = function (modelName, id, attributes) {
      modelName = modelName.toLowerCase();

      var cacheKey = 'uuid://models/' + modelName + (id ? '/' + id : '')
        , modelObj;

      // Is the model already in the cache?
      if(self.cache[cacheKey]) {
        modelObj = self.cache[cacheKey];

        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          // Only trigger if already loaded. Otherwise wait for
          // the fetch operation to do it for us
          if(modelObj.isFetched) {
            modelObj.trigger('ready');
          }
        }, delay);
      }
      // If not, create a new model, set the id, and fetch!
      else {
        modelObj = this.createModel(modelName);
        self.cache[cacheKey] = modelObj;

        if(attributes) {
          modelObj.set(attributes);
        }
        if(id) {
          modelObj.set({id:id});
        }

        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          if(attributes) {
            modelObj.isFetched = true;
            modelObj.trigger('ready');
          }
          else {
            modelObj.fetch({
              success: function () {
                // Trigger the `ready` event after data has loaded
                modelObj.isFetched = true;
                modelObj.trigger('ready');
              }
            , error: function () {
                // Trigger the `ready` event after data has loaded
                modelObj.isFetched = true;
                modelObj.trigger('ready');

                // Call the error handler
                App.error.apply(App, arguments);
              }
            });
          }
        }, delay);
      }

      return modelObj;
    };

    /**
    * Fetches a collection by attributes
    * Under the surface, this will try to use the local cache if possible
    * @param {string} collectionName - The name of the collection you want (e.g. 'posts')
    * @param {object} attributes - The attributes to initialize the collection with
    */
    this.fetchCollection = function (collectionName, attributes) {
      collectionName = collectionName.toLowerCase();

      var safeAttrs = _.filter(attributes, function (v, k) {return k != 'app';})
        , cacheKey = 'uuid://collections/' + collectionName + '/' + JSON.stringify(safeAttrs)
        , collectionObj;

      // Is the collection already in the cache?
      if(self.cache[cacheKey]) {
        collectionObj = self.cache[cacheKey];

        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          // Only trigger if already loaded. Otherwise wait for
          // the fetch operation to do it for us
          if(collectionObj.isFetched) {
            collectionObj.trigger('ready');
          }
        }, delay);
      }
      // If not, create a new collection, set the id, and fetch!
      else {
        collectionObj = this.createCollection(collectionName, attributes);
        self.cache[cacheKey] = collectionObj;

        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          collectionObj.fetch({
            success: function () {
              // Trigger the `ready` event after data has loaded
              collectionObj.isFetched = true;
              collectionObj.trigger('ready');
            }
          });
        }, delay);
      }

      return collectionObj;
    };
  };

  module.exports = db;
}());
