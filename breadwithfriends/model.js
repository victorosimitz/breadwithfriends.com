// Data Model for BreadWithFriends

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

/* Meals ///////////////////////////////////
  title: title of the meal,
  description: longer description of the meal,
  time: date and time of the meal,
  location: e.g. {address: "47 Olmsted Rd", city: "Stanford", state: "CA", zip: "94305"},
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
    }
    options.guests = options.guests || {};
    options.invites = options.invites || {};
    Meals.insert(options);
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
  insert: function(userId, meal){ return false; },
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
