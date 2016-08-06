var fetch = require('node-fetch');

var placesCall = function(place, cb) {
  var key = 'AIzaSyCHsQMx-gpiPsKxiKd9hhtEdR_GagDRHuw';
  var url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=37.76999,-122.44696&radius=500&key=${key}`;

  fetch(url).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('Place found:', data.predictions[0].description);
    var placeId = data.predictions[0].place_id;
    var detailURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}`;

    fetch(detailURL).then( function(res) {
      return res.json();
    }).then( function(data) {
      var placeLat = data.result.geometry.location.lat;
      var placeLong = data.result.geometry.location.lng;

      cb([placeLat, placeLong]);
    }).catch( function(err) {
      console.log('error on place detail', err);
    });

  }).catch(function(err) {
    console.log('err in places', err);
  });

};

module.exports = placesCall;
