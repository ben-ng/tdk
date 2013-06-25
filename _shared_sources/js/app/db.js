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
      modelName = modelName.toLowerCase();
      conditions = conditions || {};
      
      conditions = _.cloneDeep(conditions);
      
      var cacheKey = 'model://' + modelName + ':' + JSON.stringify(conditions);
      
      conditions = _.extend(conditions, {app:App});
      
      if(self.cache[cacheKey]) {
        return self.cache[cacheKey];
      }
      else {
        if(_.find(models, function (v,key) { return key === modelName;})) {
          self.cache[cacheKey] = new models[modelName](conditions);
          return self.cache[cacheKey];
        }
        else {
          throw new Error('Cannot find Model "' + modelName + '"');
        }
      }
    };
    
    /**
    * Loads a collection with the conditions
    */
    this.loadCollection = function (collectionName, conditions) {
      collectionName = collectionName.toLowerCase();
      conditions = conditions || {};
      
      conditions = _.cloneDeep(conditions);
      
      var cacheKey = 'collection://' + collectionName + ':' + JSON.stringify(conditions);
      
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
    };
  };
  
  module.exports = db;
}());