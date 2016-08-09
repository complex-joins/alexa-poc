'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var rideHelper = require('./ride-helper');
var uberHelper = require('./uber-helper');
var lyftHelper = require('./lyft-helper');

var prompt = 'With CARVIS you can order the cheapest or fastest car available. For example, you can say, CARVIS, find me the cheapest ride to Hack Reactor';
var reprompt = 'Tell me to book the cheapest or fastest car, and where you want to go';

app.launch(function (req, res) {
  res.say(prompt)
    .reprompt(reprompt)
    .shouldEndSession(false);
});

app.intent('GetEstimate', {
    'slots': {
      'MODE': 'MODE',
      'DESTINATION': 'DESTINATION',
      'DESTINATION_ONE': 'DESTINATION_ONE',
    },
    'utterances': [
      '{Find|Get|Order|Call|Book} {a|one|the|me the|me a} {MODE} {car|ride} to {DESTINATION}'
    ]
  },
  function (req, res) {
    var userId = req.userId; // the unique alexa session userId
    var mode = req.slot('MODE'); // cheapest or fastest

    // find the DESTINATION slot that is populated in this request
    console.log('req.data.request.intent.slots', req.data.request.intent.slots);
    var destination = _.filter(req.data.request.intent.slots, function (slotValue, slotKey) {
      return (slotValue.value && slotValue.value.length > 0 && slotKey.includes('DESTINATION'));
    })[0].value;
    console.log('Alexa thinks my destination is', destination);

    // todo: grab user location?
    if (_.isEmpty(mode) || _.isEmpty(destination)) {
      prompt = 'I didn\'t catch that. Please try again';
      res.say(prompt)
        .reprompt(reprompt)
        .shouldEndSession(false);
    } else {
      rideHelper.placesCall(destination, function (placeDesc, destCoords) {
        rideHelper.getEstimate(mode, destCoords, function (winner) {
          var answer = formatAnswer(winner, mode, placeDesc);
          res.say(answer)
            .send();
        });
      });
    }
    // Intent handlers that don't return an immediate response (because they
    // do some asynchronous operation) must return false
    return false;
  });

// need to be included to pass Amazon reviews
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);
app.intent('AMAZON.HelpIntent', helpFunction);

var formatAnswer = function (winner, mode, placeDesc) {
  mode = mode.includes('cheap') ? 'cheapest' : 'fastest';
  var winnerEstimate;
  var answer;

  if (!winner) {
    answer = 'There are no rides available to ${placeDesc}. Please try again.';
    return _.template(answer)({
      placeDesc: placeDesc
    });
  }

  // convert estimate to $ or minutes
  if (mode === 'fastest') {
    var minutes = Math.floor(winner.estimate / 60);
    winnerEstimate = minutes.toString() + ' minute';
    winnerEstimate += minutes > 1 ? 's' : '';
  } else {
    var dollars = Math.floor(winner.estimate / 100);
    var cents = winner.estimate % 100;
    winnerEstimate = dollars.toString() + ' dollars';
    winnerEstimate += (cents) ? ' and ' + cents.toString() + ' cents' : '';
  }

  answer = 'The ${mode} ride to ${placeDesc} is from ${winnerCompany}, with an estimate of ${winnerEstimate}';

  return _.template(answer)({
    mode: mode,
    placeDesc: placeDesc,
    winnerCompany: winner.company,
    winnerEstimate: winnerEstimate
  });
};

var exitFunction = function (req, res) {
  var exitSpeech = 'Have a nice day!';
  res.say(exitSpeech);
};
var helpFunction = function (req, res) {
  var helpSpeech = 'CARVIS finds you the cheapest and/or fastest ride to your destination. ';
  helpSpeech += 'To begin, tell me to book the cheapest or fastest car, and where you want to go';
  res.say(helpSpeech);
};

module.exports = app;
