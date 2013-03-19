if (Meteor.isClient) {

  Template.mealDetails.events({
    'click #show-invites' : function() { 
      switchToEventInvitesScreen(Session.get("showScreen").meal_id);
    },
    'click .cancel' : function() { switchToMyEventsScreen(); },
    'click #yes_rsvp' : function() {
      StripeCheckout.open({
        key: 'pk_test_LY4crE00znRKpy6FvQW0SMaQ',   //TODO stripe public key should go in Session
        address: false,
        amount: Template.mealDetails.event().price,
        name: "BreadWithFriends",
        description: Template.mealDetails.event().title,
        panelLabel: 'Enter payment information',
        token: function(res) { 
          alert(JSON.stringify(res)); 
          Meteor.call("rsvp",Template.mealDetails.invitation()._id,"yes",res.id);
        } //TODO implement a real callback
      });
    },
    'click #no_rsvp' : function() {
      Meteor.call("rsvp",Template.mealDetails.invitation()._id,"no");
    },
    'click #reserveMeal' : function() {    //DEPRECATED
      //Meteor.call("res_markReserved",Session.get("showScreen").meal_id);
      switchToReserveMealScreen(Session.get("showScreen").meal_id);
    },
    'click #cancelMeal' : function() {    //DEPRECATED
      Meteor.call("res_markCanceled",Session.get("showScreen").meal_id);
    }
  });
  
  Template.mealDetails.event = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal;
  }
 
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
  
  Template.mealDetails.price = function()
  { 
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    price = ((meal && meal.price) || 0);
    return formatPrice(price);
  }

  Template.mealDetails.host = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    if(!meal) return undefined;
    return getUserShortName(meal.host);
  };
  
  Template.mealDetails.iAmTheHost = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    if(!meal) return false; //we have bigger problems if this happens
    return meal.host == Meteor.userId();
  };
  
  Template.mealDetails.time = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && formatDateTime(meal.time);
  };

  Template.mealDetails.address = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.location.address;
  };

  Template.mealDetails.city = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.location.city;
  };

  Template.mealDetails.state = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.location.state;
  };

  Template.mealDetails.zip = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.location.zip;
  };
  
  Template.mealDetails.status = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    if(meal.status) return meal.status;
    else return JSON.stringify(meal);
  };
  
  Template.mealDetails.min_guests = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.min_guests && meal.min_guests > 0 ? meal.min_guests : "no minimum";
  };
  
  Template.mealDetails.max_guests = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.max_guests && meal.max_guests > 0 ? meal.max_guests : "no maximum";
  };
  
  Template.mealDetails.confirmed_guests = function()
  {
    return Invitations.countInvites(Session.get("showScreen").meal_id,"yes");
  };
  
  Template.mealDetails.inThePast = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal.time <= Session.get("server_time");
  };
  
  Template.mealDetails.invitation = function()
  {
    return Invitations.lookup(Meteor.userId(), Session.get("showScreen").meal_id);
  };
  
  Template.mealDetails.yes_rsvp_chosen = function()
  {
    i = Template.mealDetails.invitation();
    if(i.response && i.response == "yes")
      return "chosen";
    return "";
  };
  
  Template.mealDetails.no_rsvp_chosen = function()
  {
    i = Template.mealDetails.invitation();
    if(i.response && i.response == "no")
      return "chosen";
    return "";
  };

  Template.mealDetails.canSignUp = function()
  {
    /* NB.
        Need better validation here. Don't let people sign up for meals that are 
       in the past. Don't let people sign up for meals that are at their capacity
       limit. Don't let people sign up for meals that they are blacklisted from.
       Don't let people sign back up for meals that they have canceled?
    */
    existing_reservation = Reservations.findOne({meal_id:this._id,user_id:this.userId})
    if(!(existing_reservation && existing_reservation.status_history))
      return true; //no existing reservation, can definitely sign up
    if(existing_reservation.status_history[0].status == "RESERVED")
      return false; //already signed up, can't do it again
    if(existing_reservation.status_history[0].status == "RATED")
      return false; //it's in the past and already rated, can't change status now
    return true; //if we make it here we're good to go
  };

  Template.mealDetails.currentlyReserved = function()
  {
    meal_id=Session.get("showScreen").meal_id;
    user_id=Meteor.userId();
    existing_reservation = Reservations.findOne({meal_id:meal_id,user_id:user_id})
    if(existing_reservation && existing_reservation.status_history[0].status == "RESERVED")
      return true;
    else
      return false; 
  };
}