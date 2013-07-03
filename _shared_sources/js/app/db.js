(function () {
  var path = require('path')
    , _ = require('lodash')
  
  /**
  * Model definitions
  */
  , models = {
      'user': require('./models/user')
    , 'image': require('./models/image')
    , 'video': require('./models/video')
    , 'page': require('./models/page')
    }
  
  /**
  * Collection definitions
  */
  , collections = {
      'pagemedia': require('./collections/pageMedia')
    , 'pages': require('./collections/pages')
    , 'unprocesseduploads': require('./collections/unprocessedUploads')
    }
  
  /**
  * db (database, but not really)
  * 
  * Makes models and collections managable.
  */
  , db = function (App) {
    var self = this;
    
    this.cache = {};
    
    /**
    * Creates a new model
    * @param {string} modelName - The name of the model you want (e.g. 'posts')
    */
    this.createModel = function (modelName) {
      modelName = modelName.toLowerCase();
      
      if(_.find(models, function (v,key) { return key === modelName;})) {
        return new models[modelName]({}, {app:App});
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
    */
    this.fetchModel = function (modelName, id) {
      modelName = modelName.toLowerCase();
      
      var cacheKey = 'uuid://models/' + modelName + '/' + id
        , modelObj;
      
      // Is the model already in the cache?
      if(self.cache[cacheKey]) {
        modelObj = self.cache[cacheKey];
        
        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          modelObj.trigger('ready');
        }, 10);
      }
      // If not, create a new model, set the id, and fetch!
      else {
        modelObj = this.createModel(modelName);
        
        if(id) {
          modelObj.set({id:id});
        }
        
        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          modelObj.fetch({
            success: function () {
              // Trigger the `ready` event after data has loaded
              modelObj.trigger('ready');
            }
          });
        }, 10);
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
      
      var cacheKey = 'uuid://collections/' + collectionName + '/' + JSON.stringify(attributes)
        , collectionObj;
      
      // Is the collection already in the cache?
      if(self.cache[cacheKey]) {
        collectionObj = self.cache[cacheKey];
        
        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          collectionObj.trigger('ready');
        }, 10);
      }
      // If not, create a new collection, set the id, and fetch!
      else {
        collectionObj = this.createCollection(collectionName, attributes);
        
        // Trigger the fetch event on the next cycle
        // Which will give our user time to .listenTo() etc
        setTimeout(function () {
          collectionObj.fetch({
            success: function () {
              // Trigger the `ready` event after data has loaded
              collectionObj.trigger('ready');
            }
          });
        }, 10);
      }
      
      return collectionObj;
    };
  };
  
  module.exports = db;
}());