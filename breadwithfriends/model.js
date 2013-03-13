// Data Model for BreadWithFriends

if(Meteor.isServer)
{
  Meteor.publish("allUserData", function() {
    return Meteor.users.find({}, {fields: {'emails':1, 'profile':1}});
  });
}

// First some utility classes that are useful throughout

function Location(options)  // general class for location that we use in a bunch of places
{
  if(options.address) this.address = options.address; //this alone may be null
  this.city = options.city;
  this.state = options.state;
  this.zip = options.zip;
}

Location.prototype.isValid = function()
{ //TODO this should be more robust
  if(!this.city) return false;
  if(!this.state) return false;
  if(!this.zip) return false;
  return true;
}

var formatPrice = function(pennies)
{ 
  if(!price) price=0.00;
  price /= 100;
  priceStr = "$" + price.toFixed(2);
  return priceStr;
}

var getUserFullName = function(user_id)
{
  if(!user_id){
    return null;
  }
  u = Meteor.users.findOne(user_id);
  if(!u) return null;
  if(u.profile && u.profile.name)
  {
    return u.profile.name;
  }
  if(u.profile && u.profile.first_name)
  {
    return u.profile.last_name ? (u.profile.first_name + " " + u.profile.last_name) : u.profile.first_name;
  }
  if(u.emails) return u.emails[0].address;  //this should never happen in production, if we don't have a full name for somebody that's pretty bad
};

/* Meals ///////////////////////////////////
  title: title of the meal,
  description: longer description of the meal,
  time: date and time of the meal,
  location: e.g. {address: "47 Olmsted Rd", city: "Stanford", state: "CA", zip: "94305"},
  price: the price in USD of the meal, per person
  host: user id of the host,
  guests: array of user ids of the guests who are attending this meal,
  public: Boolean,
  invites: array of user ids of all guests who are specifically invited to this meal
*/

Meals = new Meteor.Collection("meals");

Meals.allow({   //don't let the client write directly to the db for now
  insert: function(userId, meal){
    return false;
  },
  update: function(userId, docs, fieldNames, modifier){
    return true;
  },
  remove: function(userId, docs){
    return true;
  }
});

Meals.validateMeal = function(options)
{
  if(! ( typeof options.title === "string" && options.title.length 
      && typeof options.description === "string" && options.description.length
      && typeof options.time === "string" && options.time.length      //TODO more robust validation here
      && options.location && typeof options.location.city === "string" && options.location.city.length
      && typeof options.location.state === "string" && options.location.state.length == 2
      && typeof options.location.zip === "string" && options.location.zip.length == 5
      && typeof options.price === "number" && options.price >= 0
      && options.host
      && typeof options.public === "boolean")){
    return false;
  }
  return true;
}

Meteor.methods({
  createMeal: function(options){
    options = options || {};
    if(!options.host)
    {
      options.host = this.userId;
    }
    if(!Meals.validateMeal(options))
    {
      throw new Meteor.Error(400, "Invalid meal");
      console.log("Error in createMeal: invalid meal " + JSON.stringify(options));
    }
    options.guests = options.guests || {};
    options.invites = options.invites || {};
    Meals.insert(options);
  }
});

/* Reservations ///////////////////////////////////
   user_id: corresponds to the user's id in the users collection,
   meal_id: corresponds to the meal id in the Meals collection,
   status_history: array of objects like {time, status} where status in (RESERVED, CANCELED, RATED)
*/

Reservations = new Meteor.Collection("reservations");

Reservations.allow({
  insert: function(userId, details){ return true; },
  update: function(userId, docs, fieldNames, modifier){ return true; },
  remove: function(userId, docs){ return false; }
});

Reservations.createOrUpdateReservation = function (user_id, meal_id, status)
{
  r = Reservations.findOne({user_id:user_id, meal_id:meal_id});
  console.log(JSON.stringify(r));
  if(!r) // first activity on this reservation so we need to create it
  {
    console.log("Gotta create r");
    r = {user_id: user_id, meal_id: meal_id, status_history:[]};
    console.log(JSON.stringify(r));
    r._id = Reservations.insert(r);
    console.log(JSON.stringify(r));
  }
  status = {time: (new Date()).getTime(), status:status};
  new_status_history = r.status_history || [];
  new_status_history.unshift(status);
  Reservations.update({_id: r._id}, {$set:{status_history: new_status_history}});
};

Meteor.methods({
  res_markReserved: function(meal_id){
    Reservations.createOrUpdateReservation(this.userId, meal_id, "RESERVED");
  },
  res_markCanceled: function(meal_id){  //TODO validate that the meal is currently reserved and not in the past before we can cancel it
    Reservations.createOrUpdateReservation(this.userId, meal_id, "CANCELED");
  },
  res_markRated: function(meal_id){
    Reservations.createOrUpdateReservation(this.userId, meal_id, "RATED");
  } 
});

/* UserDetails ////////////////////////////////////
   user_id: corresponds to the host's id in the users collection,
   host_ratings: {time, user, rating},
   guest_ratings: {time, user, rating},
   location: {address, city, state, zip}
*/

UserDetails = new Meteor.Collection("user_details");

UserDetails.allow({
  insert: function(userId, details){ return false; },
  update: function(userId, docs, fieldNames, modifier){ return false; },
  remove: function(userId, docs){ return false; }
});

Meteor.methods({
  createUserDetails: function(options){
    options = options || {};
    if(!options.user_id) options.user_id = this.userId;
    //TODO verify that we don't already have a UserDetails for this user
    options.host_ratings = options.host_ratings || {};
    options.guest_ratings = options.guest_ratings || {};
    if(!options.location || !(new Location(options.location).isValid()))
    {
      throw new Meteor.Error(400, "Invalid user details")
    }
    UserDetails.insert(options);
  }
});
