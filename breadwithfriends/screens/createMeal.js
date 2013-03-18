if (Meteor.isClient) {

  Template.createMeal.events({
    'click #add-meal' : function()
    {
      meal = {};
      meal.title = document.getElementById("title").value.trim();
      meal.description = document.getElementById("description").value.trim();
      meal.time = parseDateTime(document.getElementById("time").value.trim());
      meal.location = {};
      meal.location.address = document.getElementById("address").value.trim();
      meal.location.city = document.getElementById("city").value.trim();
      meal.location.state = document.getElementById("state").value.trim();
      meal.location.zip = document.getElementById("zip").value.trim();
      meal.price = Math.round(100 * parseFloat(document.getElementById("price").value.trim())); //store as pennies
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