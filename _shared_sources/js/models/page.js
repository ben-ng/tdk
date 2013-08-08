(function () {
  var Model = require('./base')
    , Video = require('./video')
    , Image = require('./image')
    , Backbone = require('../helpers/BackboneLoader')
    , _ = require('lodash')
    , stringUtils = require('utilities/lib/string')
    , Page = Model.extend(
      {
        name:'page'
      , urlRoot:function () {
        return this.app.config.baseUrl + '/pages';
      }
      , defaults: {
          name:'Untitled',
          items:[],
          userId:'',
          isPublished:false,
          errors:null
        }
      , initialize: function(attributes, opts) {
          this.set(attributes);
          this.app = opts.app || {};
        }
      , validate: function(attrs,options) {
          var errors = [];

          if(!attrs.name || attrs.name.length == 0) {
            errors.push({attr:"name",message:"Page title cannot be empty"});
          }

          if(!attrs.id) {
            //Check for duplicate page
            var pages = this.app.db.fetchCollection('pages').filter(function(page) {
              return page.attributes.name.toLowerCase() === attrs.name.toLowerCase();
            });
            if(pages && pages.length > 0) {
              errors.push({attr:"name",message:"Another page already exists with this name"});
            }
          }

          if(errors.length) {
            return errors;
          }
        }
      , toJSON: function () {
          incoming = _.clone(this.attributes);

          if(incoming.items) {
            incoming.itemList = JSON.stringify(incoming.items);
          }

          return incoming;
        }
      , parse: function(data, options) {
          try {
            data.items = JSON.parse(data.itemList);
            delete data.itemList;
          }
          catch(e) {
            data = {
              errors: 'Bad response from server: ' + e
            };
          }

          return data;
        }
      , getMedia: function () {
          return this.app.db.fetchCollection('pageMedia', {app:this.app, pageId: this.id});
        }
      , removeMedia: function(mediaId, cb) {
          var self = this
            , newItems = _.clone(self.attributes.items);

          newItems = _.reject(newItems, function (item) {
            return item.ID === mediaId;
          });

          self.set("items",newItems);
          self.save(null,{
            success:function() {
              self.app.db.fetchCollection('unprocessedUploads').fetch();
              self.app.db.fetchCollection('pages').fetch();

              cb(null);
            },
            error: function (model, response) {
              cb(response.responseText);
            }
          });
        }
      , addMedia: function(cb) {
          var self = this;

        //Start filepicker
          filepicker.pickAndStore({
            extensions:self.app.config.videoExts.concat(self.app.config.imageExts),
            multiple:false,
            signature:self.app.getUser().attributes.signature,
            policy:self.app.getUser().attributes.policy,
            services:[
              'COMPUTER',
              'DROPBOX',
              'FLICKR',
              'GOOGLE_DRIVE',
              'FTP'
            ]
          }
        //Filepicker Options
        , {
            location:'s3',
            path:self.app.getUser().attributes.path + stringUtils.uuid(10),
            access:'public'
          }
        , function(FPFiles) {
            self.app.setFlash('info', 'Just a second while we process your uploads...');

            if(Object.prototype.toString.call( FPFiles ) !== '[object Array]') {
              FPFiles = [FPFiles]; //wrap in an array.
            }

            var newItems = _.clone(self.attributes.items)
              , itemsToGo = FPFiles.length

              //Called after a file has been saved
              , afterItemComplete = function(savedModel) {
                  var new_id = savedModel.id
                    , new_name = savedModel.attributes.name
                    , type = savedModel.attributes.type.toLowerCase();

                  newItems.push({ID:new_id,NAME:new_name,TYPE:type,THUMB:savedModel.templateVars().thumbnailUrl});
                  itemsToGo--;

                  if(itemsToGo===0) {
                    self.set("items",newItems);
                    self.save(null,{
                      success:function() {
                        self.app.db.fetchCollection('unprocessedUploads').fetch();
                        self.app.db.fetchCollection('pages').fetch();

                        cb(null, FPFiles);
                      },
                      error: self.app.error
                    });
                  }
                };

            for(var i=0, ii=FPFiles.length; i<ii; i++) {
              //Save the file to the server
              (function(FPFile) {
                var model
                  , type
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
                if(self.app.util.isVideo(FPFile.filename)) {
                  model = new Video({},{app: self.app});
                  type="video";
                }
                else if(self.app.util.isImage(FPFile.filename)) {
                  model = new Image({},{app: self.app});
                  type="image";
                }

                //Set the attributes
                model.set(opts);

                //Save the model to the server
                if(type === 'image') {
                  model.cropThumbnail(null, function (err) {
                    if(err) {
                      self.app.error(err);
                    }
                    else {
                      afterItemComplete(model);
                    }
                  });
                }
                else {
                  model.save(null, {
                    success:function(savedModel, resp) {
                      //Call the completion function
                      afterItemComplete(savedModel);
                    },
                    error: self.app.error
                  });
                }
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