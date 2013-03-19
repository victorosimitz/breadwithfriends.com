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
  
  Template.eventInvitesScreen.invites = function()
  {
    evt_id = Session.get("showScreen").event_id;
    return Invitations.find({event:evt_id});
  };
  
  Template.eventInvitesScreen.number_sent = function()
  {
    return Invitations.countInvites(Session.get("showScreen").event_id);
  };
  
  Template.eventInvitesScreen.number_yes = function()
  {
    return Invitations.countInvites(Session.get("showScreen").event_id,"yes");
  };
  
  Template.eventInvitesScreen.number_waiting = function()
  {
    sent = Invitations.countInvites(Session.get("showScreen").event_id);
    yes = Invitations.countInvites(Session.get("showScreen").event_id,"yes");
    no = Invitations.countInvites(Session.get("showScreen").event_id,"no");
    return sent - yes - no;
  };
  
  Template.eventInvitesScreen.events({
    'click #add_invite': function()
    {
      email = document.getElementById("new_invite").value.trim();
      evt_id = Session.get("showScreen").event_id;
      invite = {event:evt_id,invited_user:{email:email}};
      Meteor.call("createInvitation",invite,function(error, result){
        if(!error) document.getElementById("new_invite").value="";
      });
    },
    'click #show_event': function()
    {
      switchToMealDetailsScreen(Session.get("showScreen").event_id);
    },
    'click #done': function()
    {
      switchToMyEventsScreen();
    }
  });
  
  Template.invite.invited_name = function()
  {
    return this.invited_user.email;
  };
  
  Template.invite.rsvp = function()
  {
    if(this.response) return this.response;
    else return "";
  };
}