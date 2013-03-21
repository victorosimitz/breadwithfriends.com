var formatDateTime = function(datetime /*milliseconds*/)
{
  return moment(datetime).format("MMM D, YYYY h:mm a");
};

var parseDateTime = function(datetimeString)
{
  //try using our standard format
  m = moment(datetimeString, "MMM D, YYYY h:mm a");
  //if that fails, try the built-in formats
  if(!m.isValid()) m = moment(datetimeString);
  if(m.isValid()) return m.valueOf(); // return milliseconds
  return null; //can't get a valid date out of this
};

if(Meteor.isClient)
{
  Meteor.startup(function(){
    var serverTime = function(){
      Meteor.call("getServerTime",function(error,result){ Session.set("server_time",result);});
    };
    serverTime(); //call it once, now we can call it to update in the future if we need to
  });
}

if(Meteor.isServer)
{
  Meteor.startup(function(){
    Meteor.methods({
      getServerTime: function() {
        return moment().valueOf();
      }
    });
  });
}