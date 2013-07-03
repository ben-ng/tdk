(function () {
  var View = require('./base')
    , NavbarView = View.extend({
        template: require('../templates/navbar.hbs')
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
          return this.getContext();
        }
      });
  
  module.exports = NavbarView;
}());