var fetch = require('node-fetch');

var placesCall = function(place) {
  var key = 'AIzaSyCHsQMx-gpiPsKxiKd9hhtEdR_GagDRHuw';
  // var url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${place}&key=${key}`;

  // fetch(url).then(function(res) {
  //   return res.json();
  // }).then(function(data) {
  //   console.log('success textsearch', data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
  // }).catch(function(err) {
  //   console.log('err places textsearch', err);
  // });

  var url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=37.76999,-122.44696&radius=50000&key=${key}`;
  console.log('placescall');
  fetch(url).then( function(res) {
    return res.json(); // already returns json?
  }).then( function(data) {
    console.log('places result', data);
    var placeId = data.predictions[0].place_id;
    var detailURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}`;
  
    fetch(detailURL).then( function(res) {
      return res.json();
    }).then( function(data) {
      console.log('lat place detail', data.result.geometry.location.lat);
      console.log('lng place detail', data.result.geometry.location.lng);
    }).catch( function(err) {
      console.log('error on place detail', err);
    });
  
  }).catch(function(err){
    console.log('err in places', err);
  });
};

var getEstimate = function(requestType, start, dest) {
  // take input 'requestType' that will either be fastest or cheapest as string
  var uberURL = 'https://api.uber.com/v1/';
  var lyftURL = 'https://api.lyft.com/v1/';

  var uberPath;
  var lyftPath;

  start = start || [37.7752135, -122.4369302]; // HR
  dest = dest || [37.781653, -122.4091917]; // Chris's house

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
  var lyftToken = 'Bearer gAAAAABXpNidCuyQX0kchhuvAhGu3zlZD8mX1ecTu2uRHIpWz6cWTm9xKPU_Gf2nRuF5Tg5SWuwmVXCVKxgeG2dOL8hlGsESfKFTqH05-8I4--iYFVlThooJj57OyInOc53tPmQcLzTe7yjJi-rpFKqwnQUASJzFFrOoiwzaW58dXiCDaC522eJ1mAmFmPTc9sP-OCuEFdiE9UVMwhp7oQS3bbi8LV2lEQ==';

  // TODO: refactor index.js to pass a requestType based on user intent
  // return alexa speech based on comparison result
  // start google places experiment based on alexa custom slot

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
      console.log('winner:', winner);
    } else {
      firstResult = uberEstimate;
    }
    console.log('success uber fetch - POOL', uberEstimate);
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
    } else {
      firstResult = lyftEstimate;
    }
    console.log('success lyft fetch', lyftEstimate);
  }).catch( function(err) {
    console.log('error in lyft fetch', err);
  });

  var compare = function(uberEstimate, lyftEstimate) {
    return uberEstimate < lyftEstimate ? { 'company': 'uber', 'estimate': uberEstimate }
      : { 'company': 'lyft', 'estimate': lyftEstimate };
    // TODO: what if they are equal? check the other dimension as well
    // if that is also equal, return one randomly?
  };

};

module.exports = {
  placesCall: placesCall,
  getEstimate: getEstimate
};

// fetch(url, {
//   method: 'GET',
//   body: {},
//   method: cors
// }).then().catch()

// google places
/*
https://developers.google.com/places/web-service/autocomplete
or
https://developers.google.com/maps/documentation/javascript/places-autocomplete

OR
https://smartystreets.com/features
"Get 250 free US address lookups per month, forever."
*/

// uber

/*

curl -H 'Authorization: Token pG-f76yk_TFCTMHtYHhY7xUfLVwmt9u-l4gmgiHE' \
'https://api.uber.com/v1/products?latitude=37.7752135&longitude=-122.4369302'

POOLSF - "product_id": "26546650-e557-4a7b-86e7-6a3942445247",
XSF -  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",

**  For example, uberX in San Francisco will have a different product_id than uberX in Los Angeles.

/v1/products/

parameters:
latitude
longitude

return:

{
  "products": [
    {
 "display_name": "POOL", --> important
 "product_id": "26546650-e557-4a7b-86e7-6a3942445247",
 },{//other}, {//other} ]}

 // could include an 'info about type' , but not essential.

https://api.uber.com/v1/estimates/time
https://developer.uber.com/docs/rides/api/v1-estimates-time

https://api.uber.com/v1/estimates/price
https://developer.uber.com/docs/rides/api/v1-estimates-price

format -->

    url: "https://api.uber.com/v1/estimates/price",
    headers: {
        Authorization: "Token " + uberServerToken
    }

    body: {
        start_latitude: user_latitude,
        start_longitude: user_longitude,
        end_latitude: dest_lat,
        end_longitude: dest_long
    }
}

*/

// lyft

/*

https://developer.lyft.com/docs/authentication
// need to get an auth token for testing.

'https://api.lyft.com/v1/ridetypes'

response:
{
  "ride_types": [
    {
      "display_name": "Lyft Line",
      "ride_type": "lyft_line", }, {//other}, {//other} ] }

parameters:
lat	/> the user’s current latitude
lng	/> the user’s current longitude
ride_type	/> the specific ride type

'https://api.lyft.com/v1/eta'
https://developer.lyft.com/docs/availability-etas

parameters:
lat	/> the user’s current latitude
lng	/> the user’s current longitude
ride_type /> any of the ridetypes returned by the ridetypes endpoint

'https://api.lyft.com/v1/cost'
https://developer.lyft.com/docs/availability-cost

parameters:
start_lat	\> origin latitude
start_lng	\> origin longitude
end_lat	\>	the destination latitude
end_lng	\>	the destination longitude
ride_type	\>	any of the ridetypes returned by the ridetypes endpoint

*/
