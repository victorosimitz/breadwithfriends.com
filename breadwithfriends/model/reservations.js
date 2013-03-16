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
  //console.log(JSON.stringify(r));
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
