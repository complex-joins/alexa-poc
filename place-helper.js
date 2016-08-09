var fetch = require('node-fetch');
fetch.Promise = require('bluebird');
var _ = require('lodash');

var placesCall = function(place, cb) {
  var key = 'AIzaSyCHsQMx-gpiPsKxiKd9hhtEdR_GagDRHuw';
  var url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=37.76999,-122.44696&radius=500&key=${key}';
  url = _.template(url)({
    place: place,
    key: key
  });

  fetch(url).then( function(res) {
    return res.json();
  }).then( function(data) {
    var placeDesc = data.predictions[0].description;
    console.log('Place found:', placeDesc);
    // TODO: filter out place results with distance from home > 100 miles
    var placeId = data.predictions[0].place_id;
    var detailURL = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${key}';
    detailURL = _.template(detailURL)({
      placeId: placeId,
      key: key
    });

    fetch(detailURL).then( function(res) {
      return res.json();
    }).then( function(data) {
      var placeLat = data.result.geometry.location.lat;
      var placeLong = data.result.geometry.location.lng;
      var routableAddress = data.result.formatted_address;
      // ie. "48 Pirrama Road, Pyrmont NSW, Australia"
      // NOTE: we need this for both origin and destination.
      // store this somewhere ? 

      cb(placeDesc, [placeLat, placeLong]);
    }).catch( function(err) {
      console.log('error on place detail', err);
    });

  }).catch(function(err) {
    console.log('err in places', err);
  });

};

module.exports = placesCall;
