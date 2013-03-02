if (Meteor.isClient) {

  var switchToSplashScreen = function()
  {
    Session.set("showScreen",null);
  } 

  Template.page.showSplashScreen = function()
  {
    return (Session.get("showScreen")=="splash" || !Session.get("showScreen"));
  };

  var switchToMealsNearMeScreen = function()
  {
    Session.set("showScreen","mealsNearMe");
  }
  
  Template.page.showMealsNearMeScreen = function()
  {
    return (Session.get("showScreen")=="mealsNearMe");
  }
  
  Template.splash.events({
    'click #sign-in-button' : function(){
      switchToMealsNearMeScreen();
    }
  });

  Template.mealsNearMe.events({
    'click #logout' : function () {
      // template data, if any, is available in 'this'
      switchToSplashScreen();
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
