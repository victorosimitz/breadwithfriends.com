if (Meteor.isClient) {
  
  Template.page.message = function()
  {
    if(Session.get("showScreen"))
      return Session.get("showScreen").message || null;
    return null;
  };

  var getCurrentScreenName = function() //convenience method: extract the name of the current screen
  {
    if(!Session.get("showScreen")) return undefined;
    return Session.get("showScreen").screen_name;
  }

  var switchToSplashScreen = function(message)
  {
    Session.set("showScreen",undefined);
  };

  Template.page.showSplashScreen = function()
  {
    return (getCurrentScreenName()=="splash" || !getCurrentScreenName());
  };

  var switchToMealsNearMeScreen = function(message)
  {
    Session.set("showScreen",{screen_name: "mealsNearMe", message:message});
  };
  
  Template.page.showMealsNearMeScreen = function()
  {
    return (getCurrentScreenName() == "mealsNearMe" || !getCurrentScreenName());
  };

  var switchToCreateMealScreen = function(message)
  {
    Session.set("showScreen",{screen_name:"createMeal", message:message});
  };

  Template.page.showCreateMealScreen = function()
  {
    return (getCurrentScreenName()=="createMeal");
  };

  var switchToMealDetailsScreen = function(meal_id,message)
  {
    if(!meal_id) return; //just ignore it if we don't have a meal
    Session.set("showScreen",{screen_name:"mealDetails", meal_id:meal_id, message:message});
  };

  Template.page.showMealDetailsScreen = function()
  {
    return (getCurrentScreenName()=="mealDetails");
  };

  var switchToReserveMealScreen = function(meal_id,message)
  {
    if(!meal_id) return;
    Session.set("showScreen",{screen_name:"reserveMeal", meal_id:meal_id, message:message});
  }

  Template.page.showReserveMealScreen = function()
  {
    return (getCurrentScreenName()=="reserveMeal");
  }
}