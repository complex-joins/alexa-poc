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

/*
the places returned from the above are very different (the autocomplete API call gives a much wider range of 'local' options -- probably a better bet for UX. although it 100% requires the user to OK the given destination before we can grab the lat / lng )
*/
