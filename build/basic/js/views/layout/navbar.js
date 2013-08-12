(function () {
  var View = require('../base')
    , Backbone = require('../../helpers/BackboneLoader.js')
    , _ = require('lodash')
    , NavbarView = View.extend({
        template: require('../../templates/layout/navbar.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.pages = this.app.db.fetchCollection('pages');
          this.unprocessed = this.app.db.fetchCollection('unprocessedUploads');

          this.listenTo(this.pages, 'change add remove sort', this.render, this);
          this.listenTo(this.unprocessed, 'change add remove', this.render, this);
          this.listenTo(this.app.getUser(), 'change', this.render, this);
          this.listenTo(this.app, 'flash', this.render, this);

          this.renderOnReady(this.pages, this.unprocessed, this.app.getUser());
        }
      , context: function () {
          var addMediaHref = null
            , editPageHref = null
            , editPageMakePublicHref = null
            , editPageMakePrivateHref = null
            , isPublished = null
            , modelAttrs = []
            //Count unprocessed files etc
            , unprocessedCount = this.unprocessed.length
            , pluralS = (this.unprocessed.length===1?"":"s")
            , isAre = (this.unprocessed.length===1?"is":"are")
            , unprocessedPrompt = this.unprocessed.length + ' upload' + pluralS + ' ' + isAre + ' being encoded'
            , customization = this.app.getCustomization()
            , config
            , showContact;

          if(customization && customization.attributes && customization.attributes.config) {
            config = customization.attributes.config;
            showContact = config.showContact ? config.showContact.value : false;
          }


          //Load page attrs etc
          this.pages.forEach(function(model) {
            if(!this.app.isLoggedIn() && !model.attributes.isPublished) {
              // Don't show pages that aren't published to logged out users
              return;
            }

            var safename = encodeURIComponent(model.attributes.name)
              , attrs = _.extend(_.clone(model.attributes), {
                  href: '/page/'+safename,
                  editHref: '/page/'+safename+'/edit',
                  addHref: '/page/'+safename+'/addMedia',
                  active: false
                });

            if(
              //Exact match
              Backbone.history.fragment === attrs.href.replace(/^\//,'') ||
              //Editing or adding media to page
              Backbone.history.fragment.indexOf('page/'+safename+'/')==0
            ) {
              attrs.active = true;
              editPageHref = attrs.editHref;
              editPageMakePublicHref = attrs.editHref + '/makePublic/immediately';
              editPageMakePrivateHref = attrs.editHref + '/makePrivate/immediately';
              addMediaHref = attrs.addHref;
              isPublished = attrs.isPublished;
            }
            modelAttrs.push(attrs);
          }, this);

          //Mixin our template vars
          return this.getContext({
            pages:modelAttrs,
            editPageHref:editPageHref,
            editPageMakePublicHref:editPageMakePublicHref,
            editPageMakePrivateHref:editPageMakePrivateHref,
            addMediaHref:addMediaHref,
            showContact:showContact,
            createHref:'/createPage',
            reviewHref:'/review',
            reorderHref:'/reorder',
            hasAtLeastTwoPages: this.pages.length > 1,
            isHome:Backbone.history.fragment === '',
            isPublished:isPublished,
            isContact:Backbone.history.fragment.match(/^contact/)?true:false,
            isPage:Backbone.history.fragment.match(/^(edit)?[pP]age\//)?true:false,
            isEditingPage:Backbone.history.fragment.match(/^page\/[a-zA-Z0-9\-]+\/edit$/)?true:false,
            isAddingMedia:Backbone.history.fragment.match(/^page\/[a-zA-Z0-9\-]+\/(addMedia|pickMedia)$/)?true:false,
            isEditingMedia:Backbone.history.fragment.match(/^media\/(image|video)\/[a-zA-Z0-9\-]+\/edit$/)?true:false,
            isCreatingPage:Backbone.history.fragment.match(/^createPage/)?true:false,
            isReviewingUploads:Backbone.history.fragment.match(/^review/)?true:false,
            isReorderingPages:Backbone.history.fragment.match(/^reorder/)?true:false,
            unprocessedCount:unprocessedCount,
            unprocessedPrompt:unprocessedPrompt
          });
        }
      , afterRender: function () {
          //Render all the subviews
          this.eachSubview(function (subview) {
            subview.render();
          });

          // Enable alert dismissal
          this.$('.alert').alert();
        }
      });

  module.exports = NavbarView;
}());