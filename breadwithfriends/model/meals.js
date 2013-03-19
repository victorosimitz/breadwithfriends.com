/* Meals ///////////////////////////////////
  title: title of the meal,
  description: longer description of the meal,
  time: date and time of the meal, a UNIX timestamp in milliseconds
  location: e.g. {address: "47 Olmsted Rd", city: "Stanford", state: "CA", zip: "94305"},
  price: the price in USD of the meal, per person
  host: user id of the host,
  min_guests: the event only occurs if at least this many people sign up
  max_guests: maximum number of people that can sign up,
  status: one of
     {'WAITING' : waiting for min number of guests,
      'CONFIRMED' : min number of guests has been reached,
      'FULL' : max number of guests has been reached and nobody else can sign up}
     Right now "status" has nothing to do with payment, payments should be tracked
     separately since status can change if the meal is updated. Status should only
     be set by the "updateStatus" function.
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
};

Meals.updateStatus = function(event_id)
{
  evt = Meals.findOne(event_id);
  if(!evt) return null;
  old_status = evt.status;
  new_status = null;
  confirmed_invites = Invitations.countInvites(event_id,"yes");
  //if # confirmed invites is less than min_guests, we are WAITING
  if(confirmed_invites < evt.min_guests)
  {
    new_status = 'WAITING';
  }
  //if # confirmed invites in [min_guests, max_guests), we are CONFIRMED
  if(!evt.min_guests || (confirmed_invites >= evt.min_guests && confirmed_invites < evt.max_guests))
  {
    new_status = 'CONFIRMED';
  }
  //if # confirmed invites equals or exceeds max_guests, we are FULL
  if(evt.max_guests && confirmed_invites >= evt.max_guests)
  {
    new_status = 'FULL';
  }
  //if we have switched from WAITING to CONFIRMED/FULL we may need to charge a bunch of people
  if(old_status == 'WAITING' && (new_status == 'CONFIRMED' || new_status == 'FULL'))
  {
    //TODO call to payment logic here
    console.log("Just switched from WAITING to " + new_status + ". May need to charge a bunch of people");
  }
  //console.log(old_status + " " + new_status + " " + confirmed_invites + " " + evt.min_guests + " " + evt.max_guests);
  if(!new_status) new_status = old_status; //this is pretty weird but let's handle it gracefully
  Meals.update(event_id,{$set:{status:new_status}});
  return new_status;
};

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
    meal_id = Meals.insert(meal);
    Meals.updateStatus(meal_id);
    return meal_id;
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
    Meals.updateStatus(meal._id);
  }
});