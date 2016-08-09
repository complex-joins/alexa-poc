'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var rideHelper = require('./ride-helper');
var uberHelper = require('./uber-helper');
var lyftHelper = require('./lyft-helper');

app.launch(function(req, res) {
  var prompt = 'With CARVIS you can order the cheapest or fastest car available. For example, you can say, CARVIS, find me the cheapest ride to Hack Reactor';

  // NOTE: in launch only for testing
  rideHelper.placesCall('stanford university', function(dest) {
    rideHelper.getEstimate('cheapest', dest);
  });
  // ============================== //

  res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

app.intent('GetEstimate', {
  'slots': {
    'MODE': 'MODE',
    'DESTINATION': 'AMAZON.LITERAL'
  },
  // TODO: configure these properly. also look into ./resources/*
},
  function(req, res) {
    var userId = request.userId; // the unique alexa session userId
    console.log('userId:', userId);

    var mode = req.slot('MODE'); // cheapest or fastest
    var reprompt = 'Tell me to book the cheapest or fastest car, and where you want to go';
    // todo: grab user location?
    if (_.isEmpty(mode)) {
      var prompt = 'I didn\'t catch that. Please try again';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    } else {
      // TODO: where does location come in?
      // TODO: rideHelper.placesCall(place); -- once for pickup & destination?
      // TODO: call rideHelper.getEstimate(mode);

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
