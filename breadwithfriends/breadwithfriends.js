if (Meteor.isClient) {
  //nothing to do here right now
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.publish("allUserData", function() {
      return Meteor.users.find({}, {fields: {'emails':1, 'profile':1}});
    });
  });
}
