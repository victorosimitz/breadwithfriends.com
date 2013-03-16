if (Meteor.isClient) {
//     Meteor.subscribe("allUserData");  
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish("allUserData", function() {
      return Meteor.users.find({}, {fields: {'emails':1, 'profile':1}});
    });
  });
}
