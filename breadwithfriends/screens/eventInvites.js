/* eventInvites screen
   For managing the invitations to a particular event
   Session Parameters:
     screen_name:"eventInvites",
     event_id: id of the event
*/
if(Meteor.isClient)
{
  Template.eventInvitesScreen.get_event = function()
  {
	evt_id = Session.get("showScreen").event_id;
	return Meals.findOne(evt_id);
  };
  
  Template.eventInvitesScreen.events({
    'click #show_event': function()
    {
      switchToMealDetailsScreen(Session.get("showScreen").event_id);
    },
    'click #done': function()
    {
      switchToMealsNearMeScreen();
    }
  });
}