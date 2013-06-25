(function () {
  var Model = require('./base')
    , Video = Model.extend({
        name:'media'
      , urlRoot:TK.baseURL+'/Media_is_an_abstract_class_do_not_use_it'
      , defaults: {
        name: 'Untitled',
        s3key: null,
        fpkey: null,
        mimeType: null,
        originalFilesize: null,
        userId: null,
        thumbnailS3key: null,
        thumbnailFpkey: null,
        attribs: [],
        reviewIssue: null,
        status: 0,
        type: 'unknown',
      }
      , sync: function(method, model, options) {
        var self = this;
        
        if(method === 'create' || method === 'update') {
          //For the create method we should stringify the items before sending to the server
          model.set("userAttributes",JSON.stringify(model.get("attribs")));
        }
        
        var afterCheckingMedia = function() {
          //Now check the thumbnail
          if(!model.attributes.thumbnailS3key && model.attributes.thumbnailFpkey && model.attributes.debug !== true) {
            filepicker.stat(self.thumbnailFpfile(),
              {
                path:true,
                policy:Website.user.attributes.policy,
                signature:Website.user.attributes.signature
              },
              function(metadata) {
                model.set('thumbnailS3key',metadata.path);
                Backbone.sync(method, model, options);
              }
            );
          }
          else {
            Backbone.sync(method, model, options);
          }
        }
        
        //If the s3key is unknown, try and find it first
        if(!model.attributes.s3key && model.attributes.fpkey && model.attributes.debug !== true) {
          filepicker.stat(self.fpfile(),
            {
              path:true,
              policy:Website.user.attributes.policy,
              signature:Website.user.attributes.signature
            },
            function(metadata) {
              model.set('s3key',metadata.path);
              afterCheckingMedia();
            }
          );
        }
        else {
          afterCheckingMedia();
        }
      }
      , destroy: function(options) {
        if(options.success) {
          var oldcb = options.success;
          options.success = function() {
            //Reload unprocessed files
            Website.unprocessed.fetch();
            
            if(oldcb) {
              oldcb();
            }
          };
        }
        Backbone.sync('delete',this,options);
      }
      , parse: function(data, options) {
        if(data.image) {
          data = data.image;
          delete data.image;
        }
        if(data.video) {
          data = data.video;
          delete data.video;
        }
        try {
          data.attribs = JSON.parse(data.userAttributes);
        }
        catch(e) {
          data.attribs = [];
        }
        finally {
          delete data.userAttributes;
        }
        return data;
      }
      /* Lets the user pick a thumbnail */
      , pickThumbnail: function() {
        var self = this;
        
        filepicker.pick({
          extensions:Website.imageExts,
          path:Website.user.attributes.path,
          signature:Website.user.attributes.signature,
          policy:Website.user.attributes.policy,
          services:[
            'COMPUTER',
            'DROPBOX',
            'FLICKR',
            'GOOGLE_DRIVE',
            'FTP',
            'URL',
            'IMAGE_SEARCH'
          ]
        },
        function(FPFile) {
          //Use post-processing to downsize the original image
          self.cropThumbnail(FPFile);
        },
        function(FPError) {
          if(FPError.code !== 101) {
            Website.error(FPError);
          }
        });
      }
      /* Crops a thumbnail with filepicker.io */
      , cropThumbnail: function(FPFile) {
        var self = this;
        
        if(!FPFile) {
          FPFile = self.fpfile();
        }
        
        Website.setFlash("Please wait while we process the image...","info");
        filepicker.convert(FPFile,
          //Convert options
          {
            signature:Website.user.attributes.signature,
            policy:Website.user.attributes.policy,
            width:Website.thumbnailDims.width,
            height:Website.thumbnailDims.height,
            fit:'crop'
          },
          //Store options
          {
            path:Website.user.attributes.path,
            location:'s3',
            access:'public'
          },
          function(FPFileThumb) {
            //Set s3key to null to force a re-stat
            self.save({thumbnailFpkey:FPFileThumb.url, thumbnailS3key:null},{
              success:function() {
                Website.setFlash("Thumbnail Saved!", "success");
                Website.unprocessed.fetch();
              },
              error: Website.handleError
            });
          },
          function(FPError) {
            Website.error(FPError);
          }
        );
      }
      /**
      * Use the data as the new thumbnail
      */
      , useThumbnail: function(base64Data) {
        var self = this;
        
        Website.setFlash("Please wait while we process the image...","info");
        
        filepicker.store(base64Data,
          //Convert options
          {
            signature:Website.user.attributes.signature,
            policy:Website.user.attributes.policy,
            mimetype:'image/png',
            base64decode: true,
            path:Website.user.attributes.path,
            location:'s3',
            access:'public'
          },
          function(FPFileThumb) {
            //Set s3key to null to force a re-stat
            self.save({thumbnailFpkey:FPFileThumb.url, thumbnailS3key:null},{
              success:function() {
                Website.setFlash("Thumbnail Saved!", "success");
                Website.unprocessed.fetch();
              },
              error: Website.handleError
            });
          },
          function(FPError) {
            Website.error(FPError);
          }
        );
      }
      /**
      * Returns the current model as an fpfile
      */
      , fpfile: function() {
        return {
          url:this.attributes.fpkey,
          filename:this.attributes.name,
          mimetype:this.attributes.mimeType,
          isWriteable:false,
          size:this.attributes.originalFilesize
        };
      }
      /**
      * Returns the current model's thumbnail as an fpfile
      */
      , thumbnailFpfile: function() {
        return {
          url:this.attributes.thumbnailFpkey
        };
      }
      /**
      * Helper function for templating
      */
      , templateVars: function () {
        var attrs = _.clone(this.attributes);
        
        if(attrs.s3key) {
          attrs.url = Website.s3prefix + attrs.s3key;
        }
        else {
          attrs.thumbnailUrl = Website.placeholderThumbnail();
        }
          
        if(attrs.thumbnailS3key) {
          attrs.thumbnailUrl = Website.s3prefix + attrs.thumbnailS3key;
        }
        else {
          //Halfsized with the true option
          attrs.thumbnailUrl = Website.placeholderThumbnail();
        }
        
        attrs.isImage = attrs.type === 'image';
        attrs.isVideo = attrs.type === 'video';
        
        attrs.attribs = _.map(attrs.attribs, function (attrib) {
          return attrib.replace(/^(.*:)/, '<strong>$1</strong>');
        });
        
        return attrs;
      }
    });
  
  module.exports = Video;
}());