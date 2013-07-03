(function () {
  var Logout = function () {
    var self = this;
    
    self.getUser().save({id:'logout',token:null},{
      success:function() {
        self.navigate('login',{trigger:true});
      }
    });
  };
  
  module.exports = Logout;
}());