if (Meteor.isClient) {
  Template.splash.events({
    'click #sign-in-button' : function(){
      switchToMealsNearMeScreen();
    }
  });
}