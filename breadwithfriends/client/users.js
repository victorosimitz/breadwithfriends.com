if (Meteor.isClient) {

  var getCurrentUserDetails = function()
  {
    u = Meteor.user();
    if(!u) return null;
    return UserDetails.findOne({user_id:u._id});
  };

  var adminUser = function()
  {
    ud = getCurrentUserDetails();
    if(ud && ud.admin) return ud.admin;
    else return false; 
  };
  
  Handlebars.registerHelper("adminUser", function() { return adminUser(); });
}