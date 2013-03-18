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

  /* if meal_id is null, create a new meal, otherwise edit an existing one */
  var switchToCreateOrUpdateEventScreen = function(meal_id,message)
  {
    if(!meal_id)
      Session.set("showScreen",{screen_name:"createOrUpdateEvent", message:message});
    else
      Session.set("showScreen",{screen_name:"createOrUpdateEvent",meal_id:meal_id,message:message});
  };

  Template.page.showCreateOrUpdateEventScreen = function()
  {
    return (getCurrentScreenName()=="createOrUpdateEvent");
  };
  
  var switchToEventInvitesScreen = function(event_id,message)
  {
    if(!event_id) return; //just ignore it without an event
    Session.set("showScreen",{screen_name:"eventInvites", event_id:event_id, message:message});
  };
  
  Template.page.showEventInvitesScreen = function()
  {
    return (getCurrentScreenName()=="eventInvites");
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