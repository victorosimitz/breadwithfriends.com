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

  Template.mealsNearMe.meals = function(){
    return Meals.find(); //TODO make this smarter
  };

  Template.mealsNearMe.events({
    'click #create-meal' : function () {
      options={title:"Thai Food with Skiers",
               description:"Eat Thai food and talk about skiing",
               time:"03/18/2013 7:00 PM",
               location:{address:"2850 Middlefield Rd #227", city:"Palo Alto", state:"CA", zip:"94306"},
               guests:{},
               public:true
              };
      Meteor.call("createMeal", options);
      Meteor.call("createUserDetails", {location:{city:"Stanford",state:"CA",zip:"94305"}});
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
