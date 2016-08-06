var lyftMethods = require('lyftPrivateMethods');
var baseURL = 'https://api.lyft.com/v1/'; // on which path is added.

var lyftPhoneAuth = function(phoneNumberString) {
  var url = baseURL + lyftMethods.phoneAuth.path;
  var headers = lyftMethods.phoneAuth.headers; // or headers() ?
  var body = lyftMethods.phoneAuth.body(phoneNumberString);

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: body // JSON.stringify ? or done in privateMethods ?
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('successful phoneNumber post LYFT', data);
    // TODO: next step. this also depends on the user input of 2FA code.
    // response irrelevant unless we pass through session
  }).catch( function(err) {
    console.log('error post of phoneNumber LYFT', err);
  });
};

var lyftPhoneCodeAuth = function(fourDigitCode, session) {
  var url = baseURL + lyftMethods.phoneCodeAuth.path;
  var headers = lyftMethods.phoneCodeAuth.headers(session);
  var body = lyftMethods.phoneCodeAuth.body(fourDigitCode);

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: body // JSON.stringify ? or done in privateMethods ?
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('successful phoneCodeAuth post LYFT', data);

    // TODO: next step.

  }).catch( function(err) {
    console.log('error post of phoneCodeAuth LYFT', err);
  });
};

var getCost = function(token, session, endAddress, endLat, endLng, startLat, startLng, startAddress) {
  var url = baseURL + lyftMethods.getCost.path(endAddress, endLat, endLng, startLat, startLng, startAddress);
  var headers = lyftMethods.getCost.headers(token, session);
  // note: no body.
  
  // TODO: fetch.

};

var requestRide = function(token, session, costToken, destination, origin, paymentInfo, partySize) {
  var url = baseURL + lyftMethods.requestRide.path;
  var headers = lyftMethods.requestRide.headers(token, session);
  var body = lyftMethods.requestRide.body(costToken, destination, origin, paymentInfo, partySize);

  // TODO: fetch.
};
