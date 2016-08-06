var placesCall = function(place) {
  var key = 'AIzaSyCHsQMx-gpiPsKxiKd9hhtEdR_GagDRHuw';
  var url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&location=37.76999,-122.44696&radius=500&key=${key}`;

  fetch(url).then( function(res) {
    return res.json();
  }).then( function(data) {
    console.log('places result', data);
    var place_id = data.predictions[0].place_id;
    var detailURL = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${place_id}&key=${key}`;

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

module.exports = placesCall;
