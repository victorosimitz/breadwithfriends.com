if (Meteor.isClient) {
  Meteor.subscribe("allUserData");  

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

  var getCurrentScreenName = function() //convenience method: extract the name of the current screen
  {
    if(!Session.get("showScreen")) return undefined;
    return Session.get("showScreen").screen_name;
  }

  var switchToSplashScreen = function()
  {
    Session.set("showScreen",undefined);
  };

  Template.page.showSplashScreen = function()
  {
    return (getCurrentScreenName()=="splash" || !getCurrentScreenName());
  };

  var switchToMealsNearMeScreen = function()
  {
    Session.set("showScreen",{screen_name: "mealsNearMe"});
  };
  
  Template.page.showMealsNearMeScreen = function()
  {
    return (getCurrentScreenName() == "mealsNearMe" || !getCurrentScreenName());
  };

  var switchToCreateMealScreen = function()
  {
    Session.set("showScreen",{screen_name:"createMeal"});
  };

  Template.page.showCreateMealScreen = function()
  {
    return (getCurrentScreenName()=="createMeal");
  };

  var switchToMealDetailsScreen = function(meal_id)
  {
    if(!meal_id) return; //just ignore it if we don't have a meal
    Session.set("showScreen",{screen_name:"mealDetails", meal_id:meal_id});
  };

  Template.page.showMealDetailsScreen = function()
  {
    return (getCurrentScreenName()=="mealDetails");
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
    },
    'click .show-meal-details' : function() {
      switchToMealDetailsScreen(this._id);
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

  Template.mealDetails.events({
    'click .cancel' : function() { switchToMealsNearMeScreen(); }
  });
 
  Template.mealDetails.title = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.title;
  };

  Template.mealDetails.description = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.description;
  };

  Template.mealDetails.host = function()
  {
    return "nelbert";
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    if(!meal) return undefined;
    host = Meteor.users.findOne(meal.host);
    return JSON.stringify(host);
    if(host && host.profile && host.profile.first_name) return host.profile.first_name;
    if(host && host.emails) return host.emails[0].address;
    return "Anonymous"; //it's pretty bad if we're here
  }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
