'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var rideHelper = require('./ride-helper');

var prompt = 'With CARVIS you can order the cheapest or fastest car available. For example, you can say, CARVIS, find me the cheapest ride to Hack Reactor';
var reprompt = 'Tell me to book the cheapest or fastest car, and where you want to go';

app.launch(function(req, res) {
  // NOTE: we may have to split up our query into multiple utterances --
  // cheapest || fastest
  // type of car
  // pickup (and validation)
  // destination (and validation)
  // --> all this would be much shorter if we use presets from a webapp.
  // --> can also use user location from the phone, but less accurate.
  res.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

app.intent('GetEstimate', {
  'slots': {
    'MODE': 'MODE',
    'DESTINATION': 'AMAZON.LITERAL'
  },
  'utterances': [
    '{Find|Get|Order|Call|Book} {a|one|the|me the|me a} {MODE} {car|ride} {to | DESTINATION}'
  ]
},
  function(req, res) {
    var userId = req.userId; // the unique alexa session userId
    console.log('userId:', userId);

    var mode = req.slot('MODE'); // cheapest or fastest
    var destination = req.slot('DESTINATION');
    // todo: grab user location?
    if (_.isEmpty(mode) || _.isEmpty(destination)) {
      prompt = 'I didn\'t catch that. Please try again';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    } else {
      rideHelper.placesCall(destination, function(destCoords) {
        rideHelper.getEstimate(mode, destCoords);
      });

      // TODO: populate alexa's reply in this case

      // we need to include this to end session
      res.say(prompt).reprompt(reprompt).shouldEndSession(true);
    }
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
  var helpSpeech = 'CARVIS finds you the cheapest and/or fastest rides to your destination.' + 'To begin, tell me to book the cheapest or fastest car, and where you want to go';
  res.say(helpSpeech);
};

module.exports = app;
