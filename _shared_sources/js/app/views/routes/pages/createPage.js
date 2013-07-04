(function () {
  var View = require('../../base')
    , NavbarView = require('../../layout/navbar.js')
    , FooterView = require('../../layout/footer.js')
    , IndexView = View.extend({
        template: require('../../../templates/routes/index.hbs')
      , initialize: function (options) {
          this.app = options.app;
          
          this.model = this.app.db.createModel('page');
          
          this.listenTo(this.model,'invalid',function(model,err) {
            //Restore the previous state of the model
            model.fetch();
            this.app.error(this.model, err);
          },this);
        }
      , afterRender: function () {
        this.navbar = this.navbar || new NavbarView({app:this.app});
        this.footer = this.footer || new FooterView({app:this.app});
        
        this.navbar.remove();
        this.footer.remove();
        
        this.appendSubview(this.navbar, this.$('#header'));
        this.appendSubview(this.footer, this.$('#footer'));
        
        //Render all the subviews
        this.eachSubview(function (subview) {
          subview.render();
        });
      }
      , context: function () {
          return this.getContext();
        }
      });
  
  module.exports = IndexView;
}());


Website.Views.CreatePage = BaseView.extend({
  initialize: function(options) {
    this.template = window.JST._createPage;
    
    //Initialize an empty user
    this.model = new Website.Models.Page({name:''});
    
    this.listenTo(this.model,'invalid',function(model,err) {
      //Restore the previous state of the model
      model.fetch();
      Website.error(err);
    },this);
  },
  events: {
    'submit':'performSave'
  },
  render: function() {
    this.$el.html(this.template(
      _.extend(_.clone(Website.userVars),{
        page: this.model.attributes
      })
    ));
    
    //Focus on name input if it's empty
    var inputElem = this.$('input[name=name]');
    if(inputElem.val().replace(/]w/, '') == '') {
      inputElem.val('').focus();
    }
    
    return this;
  },
  //Tries to log the user in
  performSave: function(e) {
    var self = this;
    
    e.preventDefault();
    
    var name = this.$('input[name=name]').val();
    
    this.model.save({
      userId:Website.user.attributes.id,
      name:name
    }, {
      success:function() {
        Website.navbarView.pages.fetch({
          success:function() {
            Website.Router.navigate('page/'+name,{trigger:true});
          },
          error: Website.handleError
        });
      },
      error: Website.handleError
    });
  }
});