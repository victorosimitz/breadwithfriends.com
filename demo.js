/* 
 * Special hack for BWF demo at the end of CS184.
 * Every new user is automatically invited to two 
 * events so they can get a sense of how the system 
 * works.
 */
 
if(Meteor.isServer)
{
  Accounts.onCreateUser(function(options,user){
	emails = getUserEmailsFromUser(user);
	if(!emails || emails.length == 0) return user; //weird but go on with your day
	email = emails[0];
	admin_user = UserDetails.findOne({admin:true});
	if(!admin_user) return user; //go on with your day
	events = [ Meals.findOne({title:"Whitewater Rafting", host:admin_user.user_id}),
			   Meals.findOne({title:"Superbowl Party", host:admin_user.user_id})    ];
	for(evt in events)
	{
	  invitation = {event: events[evt]._id,
					inviting_user: admin_user._id,
					invited_user: {email:email}};
	  Invitations.insert(invitation);
	};
	return user;
  });
}