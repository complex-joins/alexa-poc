'use strict';
module.change_code = 1;
var _ = require('lodash');
var fetch = require('node-fetch');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var rideHelper = require('./ride-helper');

var prompt, reprompt, helpSpeech, utterances, slots;

var endpoint = 'http://localhost:8000/alexa/launch';

app.launch(function (req, response) {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log('data inside POST to /alexa/launch:', data);
    _.assignIn(app, data); // extend app object with config properties from data

    response.say(app.prompt)
      .reprompt(app.reprompt)
      .shouldEndSession(false)
      .send();
  })
  .catch(function (err) {
    console.log('ERROR posting to /alexa/launch', err);
  });
  // Intent handlers that don't return an immediate response (because they
  // do some asynchronous operation) must return false
  return false;
});

app.intent('GetEstimate', {
    'slots': slots,
    'utterances': utterances
  },
  function (req, res) {
    var slots = req.data.request.intent.slots;
    console.log('slots:', slots);
    var userId = req.userId; // the unique alexa session userId. that said, its the *carvis userId* i should be storing in the session and passing to carvis api endpoints
    var mode = (staging) ? 'cheapest' : req.slot('MODE'); // cheapest or fastest

    // find the ORIGIN slot that is populated in this request, if any
    var originArray = _.filter(slots, function (slotValue, slotKey) {
      return (slotValue.value && slotValue.value.length > 0 && slotKey.includes('ORIGIN'));
    });
    var origin = (originArray.length) ? { query: originArray[0].value } : {};
    console.log('Alexa thinks my origin is', origin);

    // find the DESTINATION slot that is populated in this request
    var destinationQuery = _.filter(slots, function (slotValue, slotKey) {
      return (slotValue.value && slotValue.value.length > 0 && slotKey.includes('DESTINATION'));
    })[0].value;
    var destination = { query: destinationQuery };
    console.log('Alexa thinks my destination is', destination);

    // todo: grab user location?
    if (_.isEmpty(mode) || _.isEmpty(destination)) {
      prompt = 'I didn\'t catch that. Please try again';
      res.say(prompt)
        .reprompt(reprompt)
        .shouldEndSession(false);
    } else {
      if (origin.query) {
        // get originDescrip and originCoords for origin that was passed in
        rideHelper.placesCall(origin.query, function (descrip, coords) {
          origin.descrip = descrip;
          origin.coords = coords;
          if (destination.descrip) {
            // make getEstimate call since destination.descrip async call resolved first
            rideHelper.getEstimate(mode, origin.coords, destination.coords, function (winner) {
              rideHelper.addRide(winner, userId, origin, destination, function() {
                // TODO: update alexa response based on ride status (i.e., once we know it has been ordered)
                var answer = formatAnswer(winner, mode, origin.descrip, destination.descrip);
                res.say(answer)
                  .send();  
              });
            });
          }
        });
      } else {
        // set origin properties to default values
        // TODO: get origin from User table once alexa auth is implemented
        origin.descrip = 'Casa de Shez';
        origin.coords = [37.7773563, -122.3968629]; // Shez's house
      }

      rideHelper.placesCall(destination.query, function (descrip, coords) {
        destination.descrip = descrip;
        destination.coords = coords;
        if (origin.descrip) {
          // make getEstimate call since originDescrip async call resolved first
          rideHelper.getEstimate(mode, origin.coords, destination.coords, function (winner) {
            rideHelper.addRide(winner, userId, origin, destination, function() {
              // TODO: update alexa response based on ride status (i.e., once we know it has been ordered)
              var answer = formatAnswer(winner, mode, origin.descrip, destination.descrip);
              res.say(answer)
                .send();  
            });
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

var formatAnswer = function (winner, mode, originDescrip, destDescrip) {
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
    var cents = Math.floor(winner.estimate % 100);
    winnerEstimate = dollars.toString() + ' dollars';
    winnerEstimate += (cents) ? ' and ' + cents.toString() + ' cents' : '';
  }

  if (staging) {
    answer = 'A taxi from ${originDescrip} to ${destDescrip} will cost an average of ${winnerEstimate}';
  } else {
    answer = 'The ${mode} ride to ${destDescrip} is from ${winnerVendor}, with an estimate of ${winnerEstimate}';
  }

  return _.template(answer)({
    mode: mode,
    originDescrip: originDescrip,
    destDescrip: destDescrip,
    winnerVendor: winner.vendor,
    winnerEstimate: winnerEstimate
  });
};

var exitFunction = function (req, res) {
  var exitSpeech = 'Have a nice day!';
  res.say(exitSpeech);
};

var helpFunction = function (req, res) {
  res.say(helpSpeech);
};

module.exports = app;
