'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var rideHelper = require('./ride-helper');
var staging = true;

var prompt, reprompt, helpSpeech, utterances, slots;

if (staging) {
  prompt = 'With CARVIS you can find the average taxi fare from an airport to your hotel, and vice versa. For example, you can ask, CARVIS, how much is a taxi from Marriot San Francisco to SFO?';
  reprompt = 'Tell me where you want to be picked up, and where you want to go';
  helpSpeech = prompt;
  utterances = ['How much is a {car|ride|taxi} from {ORIGIN} to {DESTINATION}'];
  
  slots = {
    'ORIGIN': 'DESTINATION',
    'ORIGIN_ONE': 'DESTINATION_ONE',
    'DESTINATION': 'DESTINATION',
    'DESTINATION_ONE': 'DESTINATION_ONE',
  };
} else {
  prompt = 'With CARVIS you can order the cheapest or fastest car available. For example, you can say, CARVIS, find me the cheapest ride to Hack Reactor';
  reprompt = 'Tell me to book the cheapest or fastest car, and where you want to go';
  helpSpeech = 'CARVIS finds you the cheapest and/or fastest ride to your destination. ';
  helpSpeech += 'To begin, tell me to book the cheapest or fastest car, and where you want to go';
  utterances = ['{Find|Get|Order|Call|Book} {a|one|the|me the|me a} {MODE} {car|ride} to {DESTINATION}'];

  slots = {
    'MODE': 'MODE',
    'DESTINATION': 'DESTINATION',
    'DESTINATION_ONE': 'DESTINATION_ONE',
  };
}

app.launch(function(req, res) {
  res.say(prompt).reprompt(reprompt).shouldEndSession(false);
});

app.intent('GetEstimate', {
  'slots': slots,
  'utterances': utterances
},
  function(req, res) {
    var slots = req.data.request.intent.slots;
    console.log('slots:', slots);
    var userId = req.userId; // the unique alexa session userId
    var mode = (staging) ? 'cheapest' : req.slot('MODE'); // cheapest or fastest

    // find the ORIGIN slot that is populated in this request, if any
    var originArray = _.filter(slots, function(slotValue, slotKey) {
      return (slotValue.value && slotValue.value.length > 0 && slotKey.includes('ORIGIN'));
    });
    var origin = (originArray.length) ? originArray[0].value : null;
    console.log('Alexa thinks my origin is', origin);

    // find the DESTINATION slot that is populated in this request
    var destination = _.filter(slots, function(slotValue, slotKey) {
      return (slotValue.value && slotValue.value.length > 0 && slotKey.includes('DESTINATION'));
    })[0].value;
    console.log('Alexa thinks my destination is', destination);

    // todo: grab user location?
    if (_.isEmpty(mode) || _.isEmpty(destination)) {
      prompt = 'I didn\'t catch that. Please try again';
      res.say(prompt).reprompt(reprompt).shouldEndSession(false);
    } else {
      var originDescrip, destDescrip, originCoords, destCoords;

      if (origin) {
        // get originDescrip and originCoords for origin that was passed in
        rideHelper.placesCall(origin, function(descrip, coords) {
          originDescrip = descrip;
          originCoords = coords;
          if (destDescrip) {
            // make getEstimate call since destDescrip async call resolved first
            rideHelper.getEstimate(mode, originCoords, destCoords, function(winner) {
              var answer = formatAnswer(winner, mode, originDescrip, destDescrip);
              res.say(answer).send();
            });
          }
        });
      } else {
        // set originDescrip and originCoords to default values
        originDescrip = 'Casa de Shez';
        originCoords = [37.7773563, -122.3968629]; // Shez's house
      }

      rideHelper.placesCall(destination, function(descrip, coords) {
        destDescrip = descrip;
        destCoords = coords;
        if (originDescrip) {
          // make getEstimate call since originDescrip async call resolved first
          rideHelper.getEstimate(mode, originCoords, destCoords, function(winner) {
            var answer = formatAnswer(winner, mode, originDescrip, destDescrip);
            res.say(answer).send();
          });
        }
      });
    }
    // Intent handlers that don't return an immediate response (because they 
    // do some asynchronous operation) must return false
    return false;
  }
);

// need to be included to pass Amazon reviews
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);
app.intent('AMAZON.HelpIntent', helpFunction);

var formatAnswer = function(winner, mode, originDescrip, destDescrip) {
  mode = mode.includes('cheap') ? 'cheapest' : 'fastest';
  var winnerEstimate, answer;

  if (!winner) {
    answer = 'There are no rides available to ${destDescrip}. Please try again.';
    return _.template(answer)({
      destDescrip: destDescrip
    });
  }
  
  // convert estimate to $ or minutes
  if (mode === 'fastest') {
    var minutes = Math.floor(winner.estimate / 60);
    winnerEstimate = minutes.toString() + ' minute';
    winnerEstimate += minutes > 1 ? 's' : '';
  } else {
    winner.estimate = (staging) ? winner.estimate * 2 : winner.estimate;
    var dollars = Math.floor(winner.estimate / 100);
    var cents = winner.estimate % 100;
    winnerEstimate = dollars.toString() + ' dollars';
    winnerEstimate += (cents) ? ' and ' + cents.toString() + ' cents' : '';
  }

  if (staging) {
    answer = 'A taxi from ${originDescrip} to ${destDescrip} will cost an average of ${winnerEstimate}';
  } else {
    answer = 'The ${mode} ride to ${destDescrip} is from ${winnerCompany}, with an estimate of ${winnerEstimate}';    
  }

  return _.template(answer)({
    mode: mode,
    originDescrip: originDescrip,
    destDescrip: destDescrip,
    winnerCompany: winner.company,
    winnerEstimate: winnerEstimate
  });
};

var exitFunction = function(req, res) {
  var exitSpeech = 'Have a nice day!';
  res.say(exitSpeech);
};

var helpFunction = function(req, res) {
  res.say(helpSpeech);
};

module.exports = app;