(function () {
  var Logout = function () {
    var self = this;

    self.getUser().save({id:'logout',token:null},{
      success:function() {
        // Re-fetch all the things
        self.db.fetchCollection('pages').fetch();
        self.getCustomization().fetch();

        self.navigate('',{trigger:true});
      }
    });
  };

  module.exports = Logout;
}());