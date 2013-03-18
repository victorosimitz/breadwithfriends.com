// Some utility classes and functions that are useful in a lot of different places

function Location(options)  // general class for location that we use in a bunch of places
{
  if(options.address) this.address = options.address; //this alone may be null
  this.city = options.city;
  this.state = options.state;
  this.zip = options.zip;
}

Location.prototype.isValid = function()
{ //TODO this should be more robust
  if(!this.city) return false;
  if(!this.state) return false;
  if(!this.zip) return false;
  return true;
}

var formatPrice = function(price) //expects price to be expressed in pennies
{ 
  if(!price) price=0.00;
  price /= 100;
  priceStr = "$" + price.toFixed(2);
  return priceStr;
}

var getUserFullName = function(user_id)
{
  if(!user_id){
    return null;
  }
  u = Meteor.users.findOne(user_id);
  if(!u) return null;
  if(u.profile && u.profile.name)
  {
    return u.profile.name;
  }
  if(u.profile && u.profile.first_name)
  {
    return u.profile.last_name ? (u.profile.first_name + " " + u.profile.last_name) : u.profile.first_name;
  }
  if(u.emails) return u.emails[0].address;  //this should never happen in production, if we don't have a full name for somebody that's pretty bad
};

var getUserShortName = function(user_id)
{
  if(!user_id){
    return null;
  }
  u = Meteor.users.findOne(user_id);
  if(!u) return null;
  if(u && u.profile && u.profile.first_name) return u.profile.first_name;
  if(u && u.services && u.services.facebook && u.services.facebook.first_name)
  {
    out = u.services.facebook.first_name;
    if(u.services.facebook.last_name) out += " " + u.services.facebook.last_name[0] + "."
    return out;
  }
  //NB. we should always have a first name so if we get to any of these fallbacks we have a problem
  if(u && u.emails) return u.emails[0].address; //this really should never happen
  if(u && u.services && u.services.facebook && u.services.facebook.email) //getting desperate now
    return u.services.facebook.email;
  return "Anonymous"; //this would be pretty embarrassing
};