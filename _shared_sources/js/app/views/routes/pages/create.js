(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/pages/create.hbs')
      , events: {
          'submit': 'performSave'
        , 'click a.app': 'handleAppLink'
        }
      , initialize: function (options) {
          this.app = options.app;

          this.model = this.app.db.createModel('page');

          this.listenTo(this.model,'invalid',function(model, err) {
            this.app.error(this.model, err);
          },this);
        }
      , afterRender: function () {
        var inputElem;

        var navbar = new NavbarView({app:this.app})
          , footer = new FooterView({app:this.app});

        this.appendSubview(navbar, this.$('#header'));
        this.appendSubview(footer, this.$('#footer'));

        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });

        //Focus on name input if it's empty
        inputElem = this.$('input[name=name]');
        if(inputElem.val().replace(/]w/, '') == '') {
          inputElem.val('').focus();
        }
      }
      , context: function () {
          return this.getContext();
        }
      , performSave: function(e) {
          var self = this;

          e.preventDefault();

          var name = this.$('input[name=name]').val();

          self.model.save({
            userId:self.app.getUser().id,
            name:name
          }, {
            success: function () {
              self.app.db.fetchCollection('pages').add(self.model);

              self.app.navigate('page/'+name,{trigger:true});
            }
          , error: self.app.error
          });
        }
      });

  module.exports = IndexView;
}());