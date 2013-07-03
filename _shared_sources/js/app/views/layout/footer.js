(function () {
  var View = require('../base')
    , FooterView = View.extend({
        template: require('../../templates/layout/footer.hbs')
      , initialize: function (options) {
          this.app = options.app;
          this.listenTo(this.app.getUser(), 'change', this.render, this);
          
          this.renderOnReady(this.app.getUser());
        }
      });
  
  module.exports = FooterView;
}());