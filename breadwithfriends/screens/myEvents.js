if (Meteor.isClient) {
  
  Template.myEvents.meals_upcoming = function(){
    server_time = Session.get("server_time");
    return Meals.find({time: {$gt: server_time}}, {sort:[["time","asc"]]});
  };
  
  Template.myEvents.meals_historic = function(){
    server_time = Session.get("server_time");
    //TODO only show a few historic meals and only going back a few weeks?
    return Meals.find({time: {$lte: server_time}}, {sort:[["time","desc"]]});
  };

  Template.myEvents.events({
    'click #create-meal' : function () {
      switchToCreateOrUpdateEventScreen();
    }
  });

  Template.meal.events({
    'click .show-meal-details' : function() {
      switchToMealDetailsScreen(this._id);
    },
    'click .manage-invites' : function() {
      switchToEventInvitesScreen(this._id);
    },
    'click .edit-meal' : function() {
      switchToCreateOrUpdateEventScreen(this._id);
    },
    'click .delete-meal' : function () {
      Meals.remove(this._id);
    }
  });

  Template.meal.price = function()
  {
    price = this.price || 0.0;
    return formatPrice(price);
  };
  
  Template.meal.time = function()
  {
    return formatDateTime(this.time);
  };
  
  Template.meal.past = function()
  {
    return this.time <= Session.get("server_time") ? "past" : "";
  };
  
  Template.meal.show = function()
  {
    if(adminUser()) return true; //TODO admin users should be able to disable show-all mode
    if(Meteor.userId() == this.host)
      return true; //this user created this event
    if(Invitations.lookup(Meteor.userId(),this._id))
      return true; //this user is invited to this event
    return false; //it's none of this user's business!
  };
  
  Template.meal.canEdit = function()
  {
    if(adminUser()) return true; //admins can edit anything
    if(this.host == Meteor.userId()) return true; //people can edit their own meals
    return false;
  };
}