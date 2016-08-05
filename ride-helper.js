var fetch = require('node-fetch');

var home = [37.7752135, -122.4369302];
var work = [37.781653, -122.4091917];
var uberURL = 'https://api.uber.com/v1/';
var lyftURL = 'https://api.lyft.com/v1/';

var uberEstimate = 'estimates/time';
var uberPrice = 'estimates/price';
var uberProducts = '/products/';

// lat: 37.781653,long: -122.4091917 // HR
// lat: 37.7752135 , long: -122.4369302 // CHRIS house

var placesCall = function(place) {
  var key = 'AIzaSyCHsQMx-gpiPsKxiKd9hhtEdR_GagDRHuw';
  var url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${place}&key=${key}`;

  fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    console.log('success textsearch', data.results[0].geometry.location.lat, data.results[0].geometry.location.lng);
  }).catch(function(err) {
    console.log('err places textsearch', err);
  });

  // var url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=37.76999,-122.44696&radius=500&key=${key}`;
  // console.log('placescall');
  // fetch(url).then( function(res) {
  //   return res.json(); // already returns json?
  // }).then( function(data) {
  //   console.log('places result', data);
  //   var place_id = data.predictions[0].place_id;
  //   var detailURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${key}`;
  //
  //   fetch(detailURL).then( function(res) {
  //     return res.json();
  //   }).then( function(data) {
  //     console.log('lat place detail', data.result.geometry.location.lat);
  //     console.log('lng place detail', data.result.geometry.location.lng);
  //   }).catch( function(err) {
  //     console.log('error on place detail', err);
  //   });
  //
  // }).catch(function(err){
  //   console.log('err in places', err);
  // });
};

var getEstimate = function(start, dest, path) {
// TODO: template literals.
//var uber = `${uberURL}${path}?start_latitude=${home[0]}&start_longitude=${home[1]}&end_latitude=${work[0]}&end_longitude=${work[1]}`
// var lyft = `${lyftURL}${path}?lat=${home[0]}&lng=${home[1]}&start_lat=${home[0]}&start_lng=${home[1]}&end_lat=${work[0]}&end_lng=${work[1]}`
// NOTE: lyft has different parameters for user location based on eta/cost path.
//

  var uber = 'https://api.uber.com/v1/estimates/price?start_latitude=37.7752135&start_longitude=-122.4369302&end_latitude=37.781653&end_longitude=-122.4091917';
  fetch(uber, {
    method: 'GET',
    headers: {
      Authorization: 'Token pG-f76yk_TFCTMHtYHhY7xUfLVwmt9u-l4gmgiHE',
      'Content-Type': 'application/json'
    }
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('success uber fetch - POOL', data.prices[0]);
  }).catch( function(err) {
    console.log('error in uber fetch', err);
  });

  var lyftPath = 'eta';
  var lyft = `${lyftURL}${lyftPath}?lat=${home[0]}&lng=${home[1]}&start_lat=${home[0]}&start_lng=${home[1]}&end_lat=${work[0]}&end_lng=${work[1]}`
  var lyftToken = 'Bearer gAAAAABXo4M3_WiuuwJVC4jsg01BGsmd5c15Ntk39JvNPvsaEM815Fw6E8Ub-3ma0McwMY-DQvdRDqcjALoQbIgLzCd-aOJbXiAMemsVOlAiqChnovFueUi_jCGw1Y_gNQj7lCxUKG4DX12OH-erHrJrJkgL5_M6CZVR1dUdGRl3tyKfZLmpwgX4RqZJAfg5U0gXQtu8NEvD-BDb_Lncgl2Vr4I_X7rALA==';

  fetch(lyft, {
    method: 'GET',
    headers: {
      Authorization: lyftToken,
      'Content-Type': 'application/json'
    }
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('success lyft fetch', data);
  }).catch( function(err) {
    console.log('error in lyft fetch', err);
  });

};

module.exports = {
  getEstimate: getEstimate,
  home: home,
  work: work,
  uberEstimate: uberEstimate,
  uberPrice: uberPrice,
  placesCall: placesCall
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
