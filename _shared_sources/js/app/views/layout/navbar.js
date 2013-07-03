(function () {
  var View = require('../base')
    , Backbone = require('backbone')
    , NavbarView = View.extend({
        template: require('../../templates/layout/navbar.hbs')
      , initialize: function (options) {
          this.app = options.app || {};
          this.pages = this.app.db.fetchCollection('pages');
          this.unprocessed = this.app.db.fetchCollection('unprocessedUploads');
          
          this.listenTo(this.pages, 'change add remove sort',this.render,this);
          this.listenTo(this.unprocessed, 'change add remove',this.render,this);
          this.listenTo(this.app.getUser(), 'change', function () {
            this.pages.fetch();
          },this);
          
          this.renderOnReady(this.pages, this.unprocessed, this.app.getUser());
        }
      , context: function () {
          var addMediaHref = null
            , editPageHref = null
            , modelAttrs = []
            //Count unprocessed files etc
            , unprocessedCount = this.unprocessed.length
            , pluralS = (this.unprocessed.length===1?"":"s")
            , antiPluralS = (this.unprocessed.length!==1?"":"s")
            , unprocessedPrompt = "Choose thumbnail" + antiPluralS + " for " + this.unprocessed.length + " upload" + pluralS;

          
          //Load page attrs etc
          this.pages.forEach(function(model) {
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
              addMediaHref = attrs.addHref;
            }
            modelAttrs.push(attrs);
          });
          
          //Mixin our template vars
          return this.getContext({
            pages:modelAttrs,
            editPageHref:editPageHref,
            addMediaHref:addMediaHref,
            createHref:'/createPage',
            reviewHref:'/reviewPage',
            isHome:Backbone.history.fragment === '',
            isPage:Backbone.history.fragment.match(/^(edit)?[pP]age\//)?true:false,
            isEditingPage:Backbone.history.fragment.match(/^page\/[a-zA-Z0-9\-]+\/edit$/)?true:false,
            isAddingMedia:Backbone.history.fragment.match(/^page\/[a-zA-Z0-9\-]+\/addMedia$/)?true:false,
            isEditingMedia:Backbone.history.fragment.match(/^media\/(image|video)\/[a-zA-Z0-9\-]+\/edit$/)?true:false,
            isCreatingPage:Backbone.history.fragment.match(/^createPage/)?true:false,
            isReviewingUploads:Backbone.history.fragment.match(/^review/)?true:false,
            unprocessedCount:unprocessedCount,
            unprocessedPrompt:unprocessedPrompt
          });
        }
      });
  
  module.exports = NavbarView;
}());