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
    * Loads a model with the conditions
    */
    this.loadModel = function (modelName, conditions) {
      var cacheKey;
      
      modelName = modelName.toLowerCase();
      
      if(conditions) {
        conditions = _.cloneDeep(conditions);
        
        cacheKey = 'model://' + modelName + ':' + JSON.stringify(conditions);
        
        conditions = _.extend(conditions, {app:App});
        
        if(self.cache[cacheKey]) {
          return self.cache[cacheKey];
        }
        else {
          if(_.find(models, function (v,key) { return key === modelName;})) {
            self.cache[cacheKey] = new models[modelName]({}, conditions);
            return self.cache[cacheKey];
          }
          else {
            throw new Error('Cannot find Model "' + modelName + '"');
          }
        }
      }
      else {
        if(_.find(models, function (v,key) { return key === modelName;})) {
          return new models[modelName]({}, {app:App});
        }
        else {
          throw new Error('Cannot find Model "' + modelName + '"');
        }
      }
    };
    
    /**
    * Loads a collection with the conditions
    * @param {string} collectionName - The name of the model you want (e.g. 'post')
    * @param {string} [conditions] - The query hash you want to pass, most likely {id:'some string'}. Leave null if you don't want to cache the object
    */
    this.loadCollection = function (collectionName, conditions) {
      var cacheKey;
      
      collectionName = collectionName.toLowerCase();
      
      if(conditions) {
        conditions = _.cloneDeep(conditions);
        
        cacheKey = 'collection://' + collectionName + ':' + JSON.stringify(conditions);
        
        conditions = _.extend(conditions, {app:App});
      
        if(self.cache[cacheKey]) {
          return self.cache[cacheKey];
        }
        else {
          if(_.find(collections, function (v,key) { return key === collectionName;})) {
            self.cache[cacheKey] = new collections[collectionName]([], conditions);
            return self.cache[cacheKey];
          }
          else {
            throw new Error('Cannot find Collection "' + collectionName + '"');
          }
        }
      }
      else {
        if(_.find(collections, function (v,key) { return key === collectionName;})) {
          return new collections[collectionName]([], {app:App});
        }
        else {
          throw new Error('Cannot find Collection "' + collectionName + '"');
        }
      }
    };
  };
  
  module.exports = db;
}());