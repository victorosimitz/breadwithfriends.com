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