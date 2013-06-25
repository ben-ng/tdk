(function () {
  var Model = require('./base')
    , Video = require('./video')
    , Image = require('./image')
    , Page = Model.extend(
      {
        name:'page'
      , urlRoot:TK.baseURL+'/pages'
      , defaults: {
          name:'Untitled',
          items:[],
          userId:'',
          isPublished:false,
          errors:null
        }
      , initialize: function(opts) {
          if(opts.name) {
            this.set("name",opts.name);
          }
          
          this.media = new Website.Collections.PageMedia([],{page:this});
        }
      , validate: function(attrs,options) {
          var errors = [];
          
          if(!attrs.name || attrs.name.length == 0) {
            errors.push({attr:"name",message:"Page title cannot be empty"});
          }
          
          if(!attrs.id) {
            //Check for duplicate page
            var pages = Website.pages.findWhere({name:attrs.name});
            if(pages && pages.length > 0) {
              errors.push({attr:"name",message:"Another page already exists with this name"});
            }
          }
          
          if(errors.length) {
            return errors;
          }
        }
      , sync: function(method, model, options) {
          if(method === 'create' || method === 'update') {
            //For the create method we should stringify the items before sending to the server
            model.set("itemList",JSON.stringify(model.get("items")));
          }
          Backbone.sync(method, model, options);
        }
      , parse: function(data, options) {
          data = data.page;
          delete data.page;
          try {
            data.items = JSON.parse(data.itemList);
          }
          catch(e) {
            data.items = [];
          }
          finally {
            delete data.itemList;
          }
          //Set the page media collection if needed
          if(!this.media || !this.media.page.id) {
            this.media = new Website.Collections.PageMedia([],{page:this});
            this.media.fetch();
          }
          else {
            this.media.fetch();
          }
          return data;
        }
      , addMedia: function(cb, debug_cb) {
          var self = this;
          
        //Start filepicker
          filepicker.pickAndStore({
            extensions:Website.videoExts.concat(Website.imageExts),
            multiple:true,
            signature:Website.user.attributes.signature,
            policy:Website.user.attributes.policy,
            services:[
              'COMPUTER',
              'DROPBOX',
              'FLICKR',
              'GOOGLE_DRIVE',
              'FTP'
            ],
            debug:debug_cb?true:false
          }
        //Filepicker Options
        , {
            location:'s3',
            path:Website.user.attributes.path,
            access:'public'
        , }
          function(FPFiles) {
            if(Object.prototype.toString.call( FPFiles ) !== '[object Array]') {
              FPFiles = [FPFiles]; //wrap in an array.
            }
            
            var newItems = _.clone(self.attributes.items)
              , itemsToGo = FPFiles.length
              
              //Called after all files have been saved
              , afterItemCompete = function(new_id, new_name, type, after_save_cb) {
                  newItems.push({ID:new_id,NAME:new_name,TYPE:type,THUMB:"http://placehold.it/320x180"});
                  itemsToGo--;
                  if(itemsToGo===0) {
                    self.set("items",newItems);
                    self.save(null,{
                      success:function() {
                        Website.unprocessed.fetch();
                        after_save_cb();
                        cb(null, FPFiles);
                      },
                      error: cb
                    });
                  }
                };
            
            for(var i=0, ii=FPFiles.length; i<ii; i++) {
              //Save the file to the server
              (function(FPFile) {
                var model;
                  , type;
                  , opts = {
                    name: FPFile.filename,
                    fpkey: FPFile.url,
                    mimeType: FPFile.mimetype,
                    originalFilesize: FPFile.size,
                    userId: self.attributes.userId,
                    attribs: [],
                    status: 0
                  };
                
                //Create the correct type of model
                if(Website.util.isVideo(FPFile.filename)) {
                  model = new Video();
                  type="video";
                }
                else if(Website.util.isImage(FPFile.filename)) {
                  model = new Image();
                  type="image";
                }
                
                //Set the attributes
                model.set(opts);
                
                //If this is a testfile, mark it as so
                if(debug_cb) {
                  model.set('debug',true);
                }
                
                //Save the model to the server
                model.save(null,{
                  success:function(savedModel, resp) {
                    //Pass in a no-op callback if there was no debug callback given
                    var after_cb;
                    if(debug_cb) {
                      after_cb = debug_cb;
                    }
                    else {
                      after_cb=function(){};
                    }
                    
                    //Call the completion function
                    afterItemCompete(savedModel.attributes.id, savedModel.attributes.name, type, after_cb);
                  },
                  error: Website.handleError
                });
              })(FPFiles[i]);
            }
          },
          function(FPError) {
            cb(FPError);
          });
        }
      });
  
  module.exports = Page;
}());