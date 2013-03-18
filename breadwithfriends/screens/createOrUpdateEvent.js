if (Meteor.isClient) {

  Template.createOrUpdateEventScreen.creatingNewEvent = function()
  {
    if(!Session.get("showScreen").meal_id) return true;
    else return false;
  }
  
  Template.createOrUpdateEventScreen.get_event = function()
  {
    if(Session.get("showScreen").meal_id)
    {
      return Meals.findOne(Session.get("showScreen").meal_id);
    }
    else
    {
      return {title:"Skiers' Dinner",
              description:"Eat with fellow skiers",
              time:"Apr 1, 2013 7:30 pm",
              location:
                {address: "47 Olmsted Rd #219",
                 city: "Stanford",
                 state: "CA",
                 zip: "94305"},
               price: 1295,
               public: true};
    }
  };
  
  Template.createOrUpdateEventScreen.time = function()
  {
    evt = Template.createOrUpdateEventScreen.get_event();
    return formatDateTime(evt.time);
  };
  
  Template.createOrUpdateEventScreen.price = function()
  {
    evt = Template.createOrUpdateEventScreen.get_event();
    return formatPrice(evt.price,true/*number*/)
  };

  Template.createOrUpdateEventScreen.events({
    'click #create-or-update-event' : function()
    {
      meal = {};
      if(Session.get("showScreen").meal_id)
        meal._id = Session.get("showScreen").meal_id;
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
      if(!meal._id)
      {
		Meteor.call("createMeal", meal, function(error, meal_id)
		{
		  //now handle invitations
		  invite_set = {event:meal_id, invited_users:invites};
		  Meteor.call("createInvitations",invite_set);
		});
		switchToMealsNearMeScreen("Added a new meal: " + meal.title);
      }
      else
      {
        Meteor.call("updateMeal",meal); //still need to do something with invitations
        switchToMealsNearMeScreen("Updated meal: " + meal.title);
      }
    },
    'click #cancel' : function()
    {
      switchToMealsNearMeScreen();
    }
  });
}