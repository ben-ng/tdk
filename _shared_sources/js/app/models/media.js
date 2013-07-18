(function () {
  var Model = require('./base')
    , Backbone = require('backbone')
    , _ = require('lodash')
    , Media = Model.extend({
        name:'media'
      , urlRoot: function () {
        return this.app.config.baseUrl + '/Media_is_an_abstract_class_do_not_use_it';
      }
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
        type: 'unknown'
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
                policy:self.app.db.fetchModel('user').attributes.policy,
                signature:self.app.db.fetchModel('user').attributes.signature
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
              policy:self.app.db.fetchModel('user').attributes.policy,
              signature:self.app.db.fetchModel('user').attributes.signature
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
        var self = this;

        if(options.success) {
          var oldcb = options.success;
          options.success = function() {
            //Reload unprocessed files
            self.app.db.fetchCollection('unprocessedUploads').fetch();

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
          extensions:self.app.config.imageExts,
          path:self.app.db.fetchModel('user').attributes.path,
          signature:self.app.db.fetchModel('user').attributes.signature,
          policy:self.app.db.fetchModel('user').attributes.policy,
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
            self.app.error(FPError);
          }
        });
      }
      /* Crops a thumbnail with filepicker.io */
      , cropThumbnail: function(FPFile) {
        var self = this;

        if(!FPFile) {
          FPFile = self.fpfile();
        }

        self.app.setFlash('info', 'Please wait while we process the image...');
        filepicker.convert(FPFile,
          //Convert options
          {
            signature:self.app.db.fetchModel('user').attributes.signature,
            policy:self.app.db.fetchModel('user').attributes.policy,
            width:self.app.config.thumbnailDims.width,
            height:self.app.config.thumbnailDims.height,
            fit:'crop'
          },
          //Store options
          {
            path:self.app.getUser().attributes.path,
            location:'s3',
            access:'public'
          },
          function(FPFileThumb) {
            //Set s3key to null to force a re-stat
            self.save({thumbnailFpkey:FPFileThumb.url, thumbnailS3key:null},{
              success:function() {
                self.app.setFlash('success', 'Thumbnail saved!');
                self.app.db.fetchCollection('unprocessedUploads').fetch();
              },
              error: self.app.error
            });
          },
          function(FPError) {
            self.app.error(FPError);
          }
        );
      }
      /**
      * Use the data as the new thumbnail
      */
      , useThumbnail: function(base64Data) {
        var self = this;

        self.app.setFlash('info', 'Please wait while we process the image...');

        filepicker.store(base64Data,
          //Convert options
          {
            signature: self.app.getUser().attributes.signature,
            policy: self.app.getUser().attributes.policy,
            mimetype: 'image/png',
            base64decode: true,
            path: self.app.getUser().attributes.path,
            location: 's3',
            access: 'public'
          },
          function(FPFileThumb) {
            //Set s3key to null to force a re-stat
            self.save({thumbnailFpkey:FPFileThumb.url, thumbnailS3key:null},{
              success:function() {
                self.app.setFlash('success', 'Thumbnail saved!');
                self.app.db.fetchCollection('unprocessedUploads').fetch();
              },
              error: self.app.error
            });
          },
          function(FPError) {
            self.app.error(FPError);
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
      , templateVars: function (safePageName, halfSizeThumbnails) {
        var attrs = _.clone(this.attributes);

        halfSizeThumbnails = (halfSizeThumbnails===true);

        if(attrs.s3key) {
          attrs.url = self.app.config.s3prefix + attrs.s3key;
        }
        else {
          attrs.thumbnailUrl = self.app.util.placeholderThumbnail(halfSizeThumbnails);
        }

        if(attrs.thumbnailS3key) {
          attrs.thumbnailUrl = self.app.config.s3prefix + attrs.thumbnailS3key;
        }
        else {
          //Halfsized with the true option
          attrs.thumbnailUrl = self.app.util.placeholderThumbnail(halfSizeThumbnails);
        }

        attrs.isImage = attrs.type === 'image';
        attrs.isVideo = attrs.type === 'video';

        attrs.attribs = _.map(attrs.attribs, function (attrib) {
          return attrib.replace(/^(.*:)/, '<strong>$1</strong>');
        });

        if(this.app.isLoggedIn()) {
          attrs.editHref = '/media/'+attrs.type+'/'+attrs.id+'/edit';
        }

        if(safePageName) {
          attrs.playerUrl = 'page/'+safePageName+'/'+attrs.type+'/'+attrs.id;
        }

        return attrs;
      }
    });

  module.exports = Media;
}());