var fetch = require('node-fetch');
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

  if (requestType === 'cheapest') {
    uberPath = 'estimates/price';
    lyftPath = 'cost';
  } else if (requestType === 'fastest') {
    uberPath = 'estimates/time';
    lyftPath = 'eta';
  }

  var uberEndpoint = `${uberURL}${uberPath}?start_latitude=${start[0]}&start_longitude=${start[1]}&end_latitude=${dest[0]}&end_longitude=${dest[1]}`;
  var lyftEndpoint = `${lyftURL}${lyftPath}?lat=${start[0]}&lng=${start[1]}&start_lat=${start[0]}&start_lng=${start[1]}&end_lat=${dest[0]}&end_lng=${dest[1]}`;

  // currently hardcoded and needs to be updated ~daily
  var lyftToken = 'Bearer gAAAAABXpjQCisq76Eoa-rY_t503fGT6xAZhAaq1j3HI3-MUjlKowWsskhWQXmsw2CKRGT_f6oVW-xNYXE75kjltjfx7WitbXj70UX8Tzps55xDGcHQPI2NpPtdx23EcDbqh6f-zlU50g9sUV7Mey5EMyLi2H1tYrsVik0c3sXz63tDxqbj8aR650diL0mOEP1Az5BPJnkywmUTY6dllo4hB5Aixv8VDfA==';

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
      var dollarsString = data.prices[0].estimate.slice(1);
      // TODO: make car type dynamic. right now hardcoded to POOL by using data.prices[0]
      uberEstimate = parseFloat(dollarsString) * 100;
    } else if (uberPath === 'estimates/time') {
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
      lyftEstimate = Number(data.cost_estimates[0].estimated_cost_cents_max);
    } else if (lyftPath === 'eta') {
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
    return uberEstimate < lyftEstimate ? { 'company': 'Uber', 'estimate': uberEstimate }
      : { 'company': 'Lyft', 'estimate': lyftEstimate };
    // TODO: what if they are equal? check the other dimension as well
    // if that is also equal, return one randomly?
  };

};

module.exports = {
  placesCall: placesCall,
  getEstimate: getEstimate
};
