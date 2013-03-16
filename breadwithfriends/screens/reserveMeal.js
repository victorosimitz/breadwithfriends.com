if (Meteor.isClient) {

  Template.reserveMeal.events({
    "click #reserveMeal" : function()
    {
      Meteor.call("res_markReserved",Session.get("showScreen").meal_id);
      switchToMealsNearMeScreen("Successfully reserved meal!");
    },
    "click .cancel" : function()
    {
      switchToMealDetailsScreen(Session.get("showScreen").meal_id);
    },
    "keypress #numGuests, blur #numGuests" : function()
    {
      document.getElementById("totalCost").innerHTML = Template.reserveMeal.totalCost();
    }
  });
  
  Template.reserveMeal.meal = function()
  {
    meal_id=Session.get("showScreen").meal_id;
    meal = Meals.findOne(meal_id);
    return meal;
  };

  Template.reserveMeal.guestName = function()
  {
    return getUserFullName(Meteor.userId());
  };

  Template.reserveMeal.numGuests = function()
  {
    if(!document.getElementById("numGuests"))
      return "1"; //default value
    return document.getElementById("numGuests").value.trim();
  };

  Template.reserveMeal.calculateTotalCost = function()
  {
    pricePerPerson=this.meal().price; //Template.reserveMeal.meal().price;
    numGuests = parseInt(this.numGuests());
    return pricePerPerson * numGuests;
  };

  Template.reserveMeal.totalCost = function()
  {
    return formatPrice(Template.reserveMeal.calculateTotalCost());
  };
}