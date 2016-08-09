var _ = require('lodash');
var fetch = require('node-fetch');
fetch.Promise = require('bluebird');
var placesCall = require('./place-helper'); // invoked as placesCall();

// NOTE: refactor could be that one first does the placesCall in index.js or here, and on return of coordinates fire the getEstimate.

var getEstimate = function(requestType, dest, cb, start) {
  // take input 'requestType' that will either be 'fastest' or 'cheapest'
  var uberURL = 'https://api.uber.com/v1/';
  var lyftURL = 'https://api.lyft.com/v1/';

  var uberPath;
  var lyftPath;

  start = start || [37.7773563, -122.3968629]; // Shez's house
  dest = dest || [37.7836966, -122.4111551]; // HR

  if (requestType.includes('cheap')) {
    uberPath = 'estimates/price';
    lyftPath = 'cost';
  } else if (requestType.includes('fast')) {
    uberPath = 'estimates/time';
    lyftPath = 'eta';
  }

  var uberEndpoint = '${uberURL}${uberPath}?start_latitude=${start0}&start_longitude=${start1}&end_latitude=${dest0}&end_longitude=${dest1}';
  var lyftEndpoint = '${lyftURL}${lyftPath}?lat=${start0}&lng=${start1}&start_lat=${start0}&start_lng=${start1}&end_lat=${dest0}&end_lng=${dest1}';

  uberEndpoint = _.template(uberEndpoint)({
    uberURL: uberURL,
    uberPath: uberPath,
    start0: start[0],
    start1: start[1],
    dest0: dest[0],
    dest1: dest[1]
  });

  lyftEndpoint = _.template(lyftEndpoint)({
    lyftURL: lyftURL,
    lyftPath: lyftPath,
    start0: start[0],
    start1: start[1],
    dest0: dest[0],
    dest1: dest[1]
  });

  // currently hardcoded and needs to be updated ~daily
  // TODO: update dynamically
  var lyftToken = 'Bearer gAAAAABXqCzO85dDTZB20xCniXi9SGQPUARF3-Zzmh7haAmV5pZs6pKwADhRMBRWATEmt1crY73Cst7Q9Kwrvd5WeN6YJy7NTl-t7_kTJQDXvr6tQ4MVA6H4nCtTs5Oi1iFW_f7SAgQmeb6X5Lz9gmtywCMaQYcRDxZ8biE4Ik5lCzMxdxz2dRKQGOBLMfNVT98cuMoRBhwBTAUceT3Rj6VSw_0AqVKcBQ==';

  /* update via:
  curl -X POST -H "Content-Type: application/json" \
     --user "nhgXNFoIrr4Q:sinLMosFWSD9OiwgfnSEm3WN8y5Jd_0n" \
     -d '{"grant_type": "client_credentials", "scope": "public"}' \
     'https://api.lyft.com/oauth/token'
  */

  // TODO: refactor index.js to pass a requestType based on user intent
  // return alexa speech based on comparison result

  var firstResult = null;
  var winner = null;

  fetch(uberEndpoint, {
    method: 'GET',
    headers: {
      Authorization: 'Token pG-f76yk_TFCTMHtYHhY7xUfLVwmt9u-l4gmgiHE',
      'Content-Type': 'application/json'
    }
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    var uberEstimate;

    if (uberPath === 'estimates/price') {
      if (!data.prices) {
        uberEstimate = -1;  
      } else {
        var dollarsString = data.prices[0].estimate.slice(1);
        // TODO: make car type dynamic. right now hardcoded to POOL by using data.prices[0]
        uberEstimate = parseFloat(dollarsString) * 100;  
      }
    } else if (uberPath === 'estimates/time') {
      // TODO: make calls to BOTH time and price and return both to alexa as details
      // esp since uber will still give a time estimate even when there's no valid fare
      // (ex: destination = 'gardendale')
      uberEstimate = data.times[0].estimate;
    }

    if (firstResult) {
      winner = compare(uberEstimate, firstResult);
      console.log('Winner:', winner);
      cb(winner);
    } else {
      firstResult = uberEstimate;
    }
    console.log('Uber Pool estimate:', uberEstimate);
  }).catch( function(err) {
    console.log('error in uber fetch', err);
  });

  fetch(lyftEndpoint, {
    method: 'GET',
    headers: {
      Authorization: lyftToken,
      'Content-Type': 'application/json'
    }
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    var lyftEstimate;

    if (lyftPath === 'cost') {
      if (!data.cost_estimates || !data.cost_estimates[0].estimated_cost_cents_max) {
        lyftEstimate = -1;
      } else {
        lyftEstimate = parseFloat(data.cost_estimates[0].estimated_cost_cents_max);
      }
    } else if (lyftPath === 'eta') {
      // TODO: make calls to BOTH time and price and return both to alexa as details
      // esp since lyft will still give a time estimate even when there's no valid fare
      // (ex: destination = 'gardendale')
      lyftEstimate = data.eta_estimates[0].eta_seconds;
    }

    if (firstResult) {
      winner = compare(firstResult, lyftEstimate);
      console.log('winner:', winner);
      cb(winner);
    } else {
      firstResult = lyftEstimate;
    }
    console.log('Lyft Line estimate:', lyftEstimate);
  }).catch( function(err) {
    console.log('error in lyft fetch', err);
  });

  var compare = function(uberEstimate, lyftEstimate) {
    var uberAsWinner = { 'company': 'Uber', 'estimate': uberEstimate };
    var lyftAsWinner = { 'company': 'Lyft', 'estimate': lyftEstimate };
    if (uberEstimate < 0 && lyftEstimate > 0) {
      return lyftAsWinner;
    } else if (lyftEstimate < 0 && uberEstimate > 0) {
      return uberAsWinner;
    } else if (uberEstimate < 0 && lyftEstimate < 0) {
      return null;
    }

    return uberEstimate < lyftEstimate ? uberAsWinner : lyftAsWinner;
    // TODO: what if they are equal? check the other dimension as well
    // if that is also equal, return one randomly?
  };

};

module.exports = {
  placesCall: placesCall,
  getEstimate: getEstimate
};
