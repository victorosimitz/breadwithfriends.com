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
      free = Template.createOrUpdateEventScreen.mustBeFree();
      return {title:"Skiers' Dinner",
              description:"Eat with fellow skiers",
              time:"Apr 1, 2013 7:30 pm",
              location:
                {address: "47 Olmsted Rd #219",
                 city: "Stanford",
                 state: "CA",
                 zip: "94305"},
               price: free ? 0 : 1295};
    }
  };
  
  Template.createOrUpdateEventScreen.mustBeFree = function()
  {
    return !adminUser();
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
  
  Template.createOrUpdateEventScreen.min_guests = function()
  {
    evt = Template.createOrUpdateEventScreen.get_event();
    if(evt.min_guests) return evt.min_guests;
    else return "";
  };
  
  Template.createOrUpdateEventScreen.max_guests = function()
  {
    evt = Template.createOrUpdateEventScreen.get_event();
    if(evt.max_guests) return evt.max_guests;
    else return "";
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
      min_guests = parseInt(document.getElementById("min_guests").value.trim());
      if(min_guests >= 0) //must be set and nonnegative, otherwise just ignore it
        meal.min_guests = min_guests;
      max_guests = parseInt(document.getElementById("max_guests").value.trim());
      if(max_guests >= 0) //not sure what it means if this is zero but we'll allow it for now
        meal.max_guests = max_guests;
      if(!UserDetails.findOne({user_id:this.userId}))  //TODO do we still need this?
        Meteor.call("createUserDetails",{});
      if(!meal._id)
      {
		Meteor.call("createMeal", meal);
		switchToMyEventsScreen("Added a new event: " + meal.title);
      }
      else
      {
        Meteor.call("updateMeal",meal); //still need to do something with invitations
        switchToMyEventsScreen("Updated event: " + meal.title);
      }
    },
    'click #cancel' : function()
    {
      switchToMyEventsScreen();
    }
  });
}