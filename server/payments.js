/* payments.js
   Server-only code for processing payments with Stripe.
   Requires the stripe-meteor package available from
   https://github.com/appleifreak/stripe-meteor
*/
var Stripe = StripeAPI('sk_test_dKz8CCE4ZQFxDZKFwF3IBWeV');

//Stripe.setPublishableKey('pk_test_LY4crE00znRKpy6FvQW0SMaQ');

var processPayment = function(amount,token,callback)
{
  callback = callback || function(e,r) { if(e) console.log(JSON.stringify(e)); };
  Stripe.charges.create({
    amount:amount,
    currency:"USD",
    card:token
  }, callback);
};