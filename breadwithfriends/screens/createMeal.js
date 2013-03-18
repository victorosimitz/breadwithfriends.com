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
      if(!UserDetails.findOne({user_id:this.userId}))  //TODO do we still need this?
        Meteor.call("createUserDetails",{});
      invites = document.getElementById("invites").value.trim().split(",");
      Meteor.call("createMeal", meal, function(error, meal_id)
      {
        //now handle invitations
        invite_set = {event:meal_id, invited_users:invites};
        Meteor.call("createInvitations",invite_set);
      });
      switchToMealsNearMeScreen();
    },
    'click #cancel' : function()
    {
      switchToMealsNearMeScreen();
    }
  });
}