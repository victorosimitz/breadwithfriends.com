if (Meteor.isClient) {
  
  Template.mealsNearMe.meals_upcoming = function(){
    server_time = Session.get("server_time");
    return Meals.find({time: {$gt: server_time}}, {sort:[["time","asc"]]});
  };
  
  Template.mealsNearMe.meals_historic = function(){
    server_time = Session.get("server_time");
    //TODO only show a few historic meals and only going back a few weeks?
    return Meals.find({time: {$lte: server_time}}, {sort:[["time","desc"]]});
  };

  Template.mealsNearMe.events({
    'click #create-meal' : function () {
      switchToCreateOrUpdateEventScreen();
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
  };
  
  Template.meal.time = function()
  {
    return formatDateTime(this.time);
  };
  
  Template.meal.past = function()
  {
    return this.time <= Session.get("server_time") ? "past" : "";
  };
  
  Template.meal.canEdit = function()
  {
    if(adminUser()) return true; //admins can edit anything
    if(this.host == Meteor.userId()) return true; //people can edit their own meals
    return false;
  };
}