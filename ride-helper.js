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

var getEstimate = function(start, dest, path) {
  start = [37.7752135, -122.4369302];
  dest = [37.781653, -122.4091917];

  var body = {
    start_latitude: start[0],
    start_longitude: start[1],
    end_latitude: dest[0],
    end_longitude: dest[1],
    "product_id": "26546650-e557-4a7b-86e7-6a3942445247" // SF UBER POOL
  };

  var uber = 'https://api.uber.com/v1/estimates/price?start_latitude=37.7752135&start_longitude=-122.4369302&end_latitude=37.781653&end_longitude=-122.4091917';
  fetch(uber, {
    method: 'GET',
    headers: {
      Authorization: 'Token pG-f76yk_TFCTMHtYHhY7xUfLVwmt9u-l4gmgiHE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    mode: 'cors'
  }).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('success uber fetch', data);
  }).catch( function(err) {
    console.log('error in uber fetch', err);
  });
};

module.exports = {
  getEstimate: getEstimate,
  home: home,
  work: work,
  uberEstimate: uberEstimate,
  uberPrice: uberPrice
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
