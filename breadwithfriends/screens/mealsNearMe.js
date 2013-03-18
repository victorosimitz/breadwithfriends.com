if (Meteor.isClient) {
  
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
  };
  
  Template.meal.time = function()
  {
    return formatDateTime(this.time);
  };
  
  Template.meal.past = function()
  {
    return this.time <= Session.get("server_time") ? "past" : "";
  }
}