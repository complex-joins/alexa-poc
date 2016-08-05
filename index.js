'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var FAADataHelper = require('./faa_data_helper');
var rideHelper = require('./ride-helper');

app.launch(function(req, res) {
  // NOTE: we may have to split up our query into multiple utterances --
  // cheapest || fastest
  // type of car
  // pickup (and validation)
  // destination (and validation)
  // --> all this would be much shorter if we use presets from a webapp.
  // --> can also use user location from the phone, but less accurate.

  var prompt = 'With CARVIS you can order the cheapest or fastest ride available. Tell me CHEAPEST or FASTEST and your start and end destinations';

  // NOTE: in launch only for testing
  rideHelper.placesCall('944 market st');
  rideHelper.getEstimate('fastest');
  // ============================== //

  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('carvis', {
  'slots': {
    'AIRPORTCODE': 'FAACODES',
    'LOCATION': 'LOCATION',
    'MODES': 'MODES',
    'RIDETYPES': 'RIDETYPES'
  },
  // TODO: configure these properly. also look into ./resources/*
    'utterances': ['get me the {-|MODES} ride from {|LOCATION} to {|LOCATION}']
  // 'utterances': ['{|flight|airport} {|delay|status} {|info} {|for} {-|AIRPORTCODE}']
},
  function(req, res) {
    var userId = request.userId; // the unique alexa session userId

    var mode = req.slot('MODE'); // cheapest or fastest
    var reprompt = 'Tell me Cheapest of Fastest and where you want to go';
    // todo: grab user location?
    if (_.isEmpty(mode)) {
      var prompt = 'I didn\'t hear. Tell me cheapest or fastest';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    } else {
      // TODO: where does location come in?
      // TODO: rideHelper.placesCall(place); -- once for pickup & destination?
      // TODO: call rideHelper.getEstimate(mode);

      // we need to include this to end session
      res.say(prompt).reprompt(reprompt).shouldEndSession(true);
    }

    // //get the slot
    // var airportCode = req.slot('AIRPORTCODE');
    // var reprompt = 'Tell me an airport code to get delay information.';
    // if (_.isEmpty(airportCode)) {
    //   var prompt = 'I didn\'t hear an airport code. Tell me an airport code.';
    //   res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    //   return true;
    // } else {
    //   var faaHelper = new FAADataHelper();
    //   faaHelper.requestAirportStatus(airportCode).then(function(airportStatus) {
    //     console.log(airportStatus);
    //     res.say(faaHelper.formatAirportStatus(airportStatus)).send();
    //   }).catch(function(err) {
    //     console.log(err.statusCode);
    //     var prompt = 'I didn\'t have data for an airport code of ' + airportCode;
    //      //https://github.com/matt-kruse/alexa-app/blob/master/index.js#L171
    //     res.say(prompt).reprompt(reprompt).shouldEndSession(true).send();
    //   });
    //   return false;
    // }
  }
);

// need to be included to pass Amazon reviews.
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);
app.intent('AMAZON.HelpIntent', helpFunction);

var exitFunction = function(req, res) {
  var exitSpeech = 'Have a good one!';
  res.say(exitSpeech);
};
var helpFunction = function(req, res) {
  var helpSpeech = 'Carvis enables you to find the cheapest and/or fastest rides to your destination.' + 'Just say cheapest or fastest and give us your start and end destinations to begin!';
  res.say(helpSpeech);
};

//hack to support custom utterances in utterance expansion string
console.log(app.utterances().replace(/\{\-\|/g, '{'));
module.exports = app;
