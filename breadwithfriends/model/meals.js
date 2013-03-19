/* Meals ///////////////////////////////////
  title: title of the meal,
  description: longer description of the meal,
  time: date and time of the meal, a UNIX timestamp in milliseconds
  location: e.g. {address: "47 Olmsted Rd", city: "Stanford", state: "CA", zip: "94305"},
  price: the price in USD of the meal, per person
  host: user id of the host,
  min_guests: the event only occurs if at least this many people sign up
  max_guests: maximum number of people that can sign up
*/

//TODO add image
//TODO add min and max # attendees
Meals = new Meteor.Collection("meals");

Meals.allow({   //don't let the client write directly to the db for now
  insert: function(userId, meal){
    return false;
  },
  update: function(userId, docs, fieldNames, modifier){
    return false;
  },
  remove: function(userId, docs){
    return true; //TODO should disable this and add a delete function in the methods below
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
      && options.host)){
    return false;
  }
  return true;
}

Meteor.methods({
  createMeal: function(meal){
    meal = meal || {};
    if(!meal.host)
    {
      meal.host = this.userId;
    }
    if(!Meals.validateMeal(meal))
    {
      console.log("Error in createMeal: invalid meal " + JSON.stringify(meal));
      throw new Meteor.Error(400, "Invalid meal");
    }
    meal.min_guests = meal.min_guests || 0;
    return Meals.insert(meal);
  },
  updateMeal: function(meal){ //TODO should combine this with createMeal
    meal = meal || {};
    if(!meal.host)
    {
      meal.host = this.userId;
    }
    if(!Meals.validateMeal(meal) || !meal._id)
    {
      console.log("Error in updateMeal: invalid meal " + JSON.stringify(meal));
      throw new Meteor.Error(400, "Invalid meal");
    }
    meal.min_guests = meal.min_guests || 0;
    Meals.update(meal._id, meal);
  }
});