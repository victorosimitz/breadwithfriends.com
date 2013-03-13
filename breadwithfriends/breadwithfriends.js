if (Meteor.isClient) {
  Meteor.subscribe("allUserData");  

  var getCurrentUserDetails = function()
  {
    u = Meteor.user();
    if(!u) return null;
    return UserDetails.findOne({user_id:u._id});
  };

  var adminUser = function()
  {
    ud = getCurrentUserDetails();
    if(ud && ud.admin) return ud.admin;
    else return false; 
  };
  Handlebars.registerHelper("adminUser", function() { return adminUser(); });

  var getCurrentScreenName = function() //convenience method: extract the name of the current screen
  {
    if(!Session.get("showScreen")) return undefined;
    return Session.get("showScreen").screen_name;
  }

  var switchToSplashScreen = function()
  {
    Session.set("showScreen",undefined);
  };

  Template.page.showSplashScreen = function()
  {
    return (getCurrentScreenName()=="splash" || !getCurrentScreenName());
  };

  var switchToMealsNearMeScreen = function()
  {
    Session.set("showScreen",{screen_name: "mealsNearMe"});
  };
  
  Template.page.showMealsNearMeScreen = function()
  {
    return (getCurrentScreenName() == "mealsNearMe" || !getCurrentScreenName());
  };

  var switchToCreateMealScreen = function()
  {
    Session.set("showScreen",{screen_name:"createMeal"});
  };

  Template.page.showCreateMealScreen = function()
  {
    return (getCurrentScreenName()=="createMeal");
  };

  var switchToMealDetailsScreen = function(meal_id)
  {
    if(!meal_id) return; //just ignore it if we don't have a meal
    Session.set("showScreen",{screen_name:"mealDetails", meal_id:meal_id});
  };

  Template.page.showMealDetailsScreen = function()
  {
    return (getCurrentScreenName()=="mealDetails");
  };

  var switchToReserveMealScreen = function(meal_id)
  {
    if(!meal_id) return;
    Session.set("showScreen",{screen_name:"reserveMeal", meal_id:meal_id});
  }

  Template.page.showReserveMealScreen = function()
  {
    return (getCurrentScreenName()=="reserveMeal");
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
      switchToCreateMealScreen();
    }
  });

  Template.meal.events({
    'click .delete-meal' : function () {
      Meals.remove(this._id);
    },
    'click .show-meal-details' : function() {
      switchToMealDetailsScreen(this._id);
    }
  });

  Template.meal.price = function()
  {
    price = this.price || 0.0;
    return formatPrice(price);
  }


  Template.createMeal.events({
    'click #add-meal' : function()
    {
      meal = {};
      meal.title = document.getElementById("title").value.trim();
      meal.description = document.getElementById("description").value.trim();
      meal.time = document.getElementById("time").value.trim();
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

  Template.mealDetails.events({
    'click .cancel' : function() { switchToMealsNearMeScreen(); },
    'click #reserveMeal' : function() { 
      //Meteor.call("res_markReserved",Session.get("showScreen").meal_id);
      switchToReserveMealScreen(Session.get("showScreen").meal_id);
    },
    'click #cancelMeal' : function() { 
      Meteor.call("res_markCanceled",Session.get("showScreen").meal_id);
    }
  });
 
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
    host = Meteor.users.findOne(meal.host);
    //TODO instead of first name return first name and last initial e.g. "Victor O."
    if(host && host.profile && host.profile.first_name) return host.profile.first_name;
    //NB. we should always have a first name so if we get to any of these fallbacks we have a problem
    if(host && host.emails) return host.emails[0].address; //this really should never happen
    return "Anonymous"; //it's pretty bad if we're here
  };
  
  Template.mealDetails.time = function()
  {
    meal = Meals.findOne(Session.get("showScreen").meal_id);
    return meal && meal.time;
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

  Template.reserveMeal.events({
    "click #reserveMeal" : function()
    {
      Meteor.call("res_markReserved",Session.get("showScreen").meal_id);
    },
    "click .cancel" : function()
    {
      switchToMealDetailsScreen(Session.get("showScreen").meal_id);
    },
    "keypress #numGuests, blur #numGuests" : function()
    {
      document.getElementById("totalCost").innerHTML = Template.reserveMeal.totalCost();
    }
  });
  
  Template.reserveMeal.meal = function()
  {
    meal_id=Session.get("showScreen").meal_id;
    meal = Meals.findOne(meal_id);
    return meal;
  };

  Template.reserveMeal.guestName = function()
  {
    return getUserFullName(Meteor.userId());
  };

  Template.reserveMeal.numGuests = function()
  {
    if(!document.getElementById("numGuests"))
      return "1"; //default value
    return document.getElementById("numGuests").value.trim();
  };

  Template.reserveMeal.calculateTotalCost = function()
  {
    pricePerPerson=this.meal().price; //Template.reserveMeal.meal().price;
    numGuests = parseInt(this.numGuests());
    return pricePerPerson * numGuests;
  };

  Template.reserveMeal.totalCost = function()
  {
    return formatPrice(Template.reserveMeal.calculateTotalCost());
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
