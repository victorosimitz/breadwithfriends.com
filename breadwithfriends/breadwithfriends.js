if (Meteor.isClient) {
  Meteor.startup(function(){
    Meteor.subscribe("allUserData"); 
  });
}

if (Meteor.isServer) {
  //TODO should explicitly publish everything here and disable auto-publish
  Meteor.startup(function () {
    Meteor.publish("allUserData", function(){
      return Meteor.users.find({}, {fields: {'emails':1, 'profile':1}});
    });
  });
}
