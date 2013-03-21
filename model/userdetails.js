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
