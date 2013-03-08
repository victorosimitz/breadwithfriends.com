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

  var switchToSplashScreen = function()
  {
    Session.set("showScreen",null);
  };

  Template.page.showSplashScreen = function()
  {
    return (Session.get("showScreen")=="splash" || !Session.get("showScreen"));
  };

  var switchToMealsNearMeScreen = function()
  {
    Session.set("showScreen","mealsNearMe");
  };
  
  Template.page.showMealsNearMeScreen = function()
  {
    return (Session.get("showScreen")=="mealsNearMe" || !Session.get("showScreen"));
  };

  var switchToCreateMealScreen = function()
  {
    Session.set("showScreen","createMeal");
  };

  Template.page.showCreateMealScreen = function()
  {
    return (Session.get("showScreen")=="createMeal");
  };
  
  Template.splash.events({
    'click #sign-in-button' : function(){
      switchToMealsNearMeScreen();
    }
  });

  Template.mealsNearMe.meals = function(){
    return Meals.find(); //TODO make this smarter
  };

  Template.mealsNearMe.events({
    'click #create-meal' : function () {
      switchToCreateMealScreen();
    }
  });
  
  Template.meal.events({
    'click .delete-meal' : function () {
      Meals.remove(this._id);
    }
  });

  Template.createMeal.events({
    'click #add-meal' : function()
    {
      meal = {};
      meal.title = document.getElementById("title").value.trim();
      meal.description = document.getElementById("description").value.trim();
      meal.time = document.getElementById("time").value.trim();
      meal.location = {};
      meal.location.address = document.getElementById("address").value.trim();
      meal.location.city = document.getElementById("city").value.trim();
      meal.location.state = document.getElementById("state").value.trim();
      meal.location.zip = document.getElementById("zip").value.trim();
      meal.public = document.getElementById("public").checked;
      if(!UserDetails.findOne({user_id:this.userId}))  //TODO we really should move this check somewhere else
        Meteor.call("createUserDetails",{});
      Meteor.call("createMeal", meal);
      switchToMealsNearMeScreen();
    },
    'click #cancel' : function()
    {
      switchToMealsNearMeScreen();
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
