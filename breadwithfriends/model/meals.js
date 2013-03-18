/* Meals ///////////////////////////////////
  title: title of the meal,
  description: longer description of the meal,
  time: date and time of the meal, a UNIX timestamp in milliseconds
  location: e.g. {address: "47 Olmsted Rd", city: "Stanford", state: "CA", zip: "94305"},
  price: the price in USD of the meal, per person
  host: user id of the host,
  guests: array of user ids of the guests who are attending this meal,
  public: Boolean,
  invites: array of user ids of all guests who are specifically invited to this meal
*/

//TODO add image
//TODO add min and max # attendees
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
      //TODO validate that the date isn't in the past -- for now this is useful for testing purposes
      && typeof options.time === "number" 
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