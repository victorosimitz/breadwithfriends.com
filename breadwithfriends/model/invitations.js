/* Invitations
   event: id of the event,
   inviting_user: usually the host of the event,
   invited_user: the id OR email address of the user invited to the event,
          in a format like {email: "a@b.c"} or {user_id:"xyz"}
   response: may be null, otherwise one of [yes, no]
*/

Invitations = new Meteor.Collection("invitations");

Invitations.allow({
  insert: function(userId, meal){
    return false;
  },
  update: function(userId, docs, fieldNames, modifier){
    return true;
  },
  remove: function(userId, docs){
    return true;
  }
});

Invitations.validateInvitation = function(invitation)
{
  if(!(invitation.event && Meals.findOne(invitation.event)))
    return false; //event not specified or invalid
  //TODO should also verify that inviting user is authorized to invite to this event
  if(!(invitation.inviting_user && Meteor.users.findOne(invitation.inviting_user)))
    return false; //inviting user not specified or invalid
  //TODO invited users could be user ids or just email addresses, should validate
  //that it is one or the other
  if(!invitation.invited_user)
    return false; //invited user not specified
  if(!invitation.invited_user.email && !invitation.invited_user.uid)
    return false; //invited user is specified but not valid
  if(invitation.response && !Invitations.validateResponse())
    return false; //invitation response is set, but invalid
  return true; //must be good to go if we get this far
};

Invitations.validateResponse = function(response)
{
  if(response == "yes" || response == "no")
    return true;
  else
    return false;
}

Invitations.lookup = function(user_id,event_id)
{
  //since invitations are stored against email address we need to find all known email
  //addresses for this user
  emails = getUserEmails(user_id) || [];
  //console.log(emails);
  invitation = null;
  i = 0;
  while(!invitation && i < emails.length)
  {
    invitation = Invitations.findOne({event:event_id,"invited_user.email":emails[i]});
    i++;
  }
  return invitation; //may still be null
};

/* Count the invites to a particular event.
   If rsvp is specified we count only the invites
   with a particular rsvp ("yes" or "no"), otherwise
   we count all invites for that event.
*/
Invitations.countInvites = function(event_id, rsvp)
{
  c = null;
  if(!rsvp)
    c = Invitations.find({event:event_id});
  else
    c = Invitations.find({event:event_id,response:rsvp});
  return c.count();
};

Meteor.methods({
  createInvitations: function(invite_set){ //right now we assume users are invited by email address
    invite_set.inviting_user = invite_set.inviting_user || this.userId;
    //console.log(JSON.stringify(invite_set));
    for(i in invite_set.invited_users)
    {
      invited_user = invite_set.invited_users[i].trim();
      invitation = {event:invite_set.event,
                    inviting_user:invite_set.inviting_user,
                    invited_user:{email:invited_user}};
      if(!Invitations.validateInvitation(invitation)) //log an error and keep going
        console.log("Invalid invitation: " + JSON.stringify(invitation));
      Invitations.insert(invitation);
    }
  },
  createInvitation: function(invitation){
    invitation.inviting_user = invitation.inviting_user || this.userId;
    if(!Invitations.validateInvitation(invitation))
    {
      console.log("Invalid invitation: " + JSON.stringify(invitation));
      throw new Meteor.Error(400, "Invalid invitation");
    }
    Invitations.insert(invitation);
  },
  rsvp: function(invitation_id, rsvp){
    inv = Invitations.findOne(invitation_id);
    if(!inv)
    {
      console.log("Invalid invitation to RSVP: " + invitation_id);
      throw new Meteor.Error(400, "Invalid RSVP");
    }
    if(!Invitations.validateResponse(rsvp))
    {
      console.log("Invalid RSVP: " + rsvp);
      throw new Meteor.Error(400, "Invalid RSVP");
    }
    Invitations.update(invitation_id, {$set:{response:rsvp}});
    Meals.updateStatus(inv.event);
  }
});