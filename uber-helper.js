var fetch = require('node-fetch');
var uberMethods = require('./uberPrivateMethods');
var baseURL = 'http://cn-sjc1.uber.com'; // https ?

var login = function(username, password) {
  var path = uberMethods.login.path;
  var body = uberMethods.login.body(username, password);

  fetch(baseURL + path, {

  }).then( function())
  // fetch
  // db post

};

var requestRide = function(origin) {
  var path = uberMethods.requestRide.path;
  var body = uberMethods.requestRide.body(origin);


};

var confirmPickup = function(priceToken, priceId, destination) {
  var path = uberMethods.confirmPickup.path;
  var body = uberMethods.requestRide.body(priceToken, priceId, destination);
  // headers



};

module.exports = {

};
