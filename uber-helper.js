var fetch = require('node-fetch');
var uberMethods = require('./uberPrivateMethods');
var baseURL = 'http://cn-sjc1.uber.com'; // https ?

var login = function(username, password) {
  var path = uberMethods.login.path;
  var body = uberMethods.login.body(username, password);
  var headers = uberMethods.login.headers();

  fetch(baseURL + path, {
    headers: headers,
    body: JSON.stringify(body)
  }).then( function(res) {
    return res.json();
  }).then( (function(data) {
    //DB post
    var response = uberMethods.login.responseMethod(data);
    // do something client/non-gitignored side with response
  }).catch( function(err) {
    console.log('ERROR login UBER', err);
  });
};

var requestRide = function(origin) {
  var path = uberMethods.requestRide.path;
  var body = uberMethods.requestRide.body(origin);
  var headers = uberMethods.requestRide.headers();

  fetch(baseURL + path, {
    headers: headers,
    body: JSON.stringify(body)
  }).then( function(res) {
    return res.json();
  }).then( (function(data) {
    //DB post
    var response = uberMethods.requestRide.responseMethod(data);
    // do something client/non-gitignored side with response
  }).catch( function(err) {
    console.log('ERROR login UBER', err);
  });
};

var confirmPickup = function(priceToken, priceId, destination) {
  var path = uberMethods.confirmPickup.path;
  var body = uberMethods.confirmPickup.body(priceToken, priceId, destination);
  var headers = uberMethods.confirmPickup.headers();

  fetch(baseURL + path, {
    headers: headers,
    body: JSON.stringify(body)
  }).then( function(res) {
    return res.json();
  }).then( (function(data) {
    //DB post
    var response = uberMethods.confirmPickup.responseMethod(data);
    // do something client/non-gitignored side with response
  }).catch( function(err) {
    console.log('ERROR login UBER', err);
  });
};

module.exports = {
  login: login,
  requestRide: requestRide,
  confirmPickup: confirmPickup
};
