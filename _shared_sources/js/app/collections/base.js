var BaseCollection = Backbone.Collection.extend({
  constructor: function(){
    Backbone.Collection.prototype.constructor.apply(this, arguments);
 
    this.onResetCallbacks = [];
    this.on("reset", this.collectionReset, this);
  },
 
  onReset: function(callback){
    this.onResetCallbacks.push(callback);
    this.collectionLoaded && this.fireResetCallbacks();
  },
 
  collectionReset: function(){
    if (!this.collectionLoaded) {
      this.collectionLoaded = true
    }
    this.fireResetCallbacks();
  },
 
  fireResetCallbacks: function(){
    var callback = this.onResetCallbacks.pop();
    if (callback){
      callback(this);
      this.fireResetCallbacks();
    }
  }
});