'use strict';
module.change_code = 1;
var _ = require('lodash');
var fetch = require('node-fetch');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');

var slotsForTesting = {
  'MODE': 'MODE',
  'DESTINATION': 'DESTINATION',
  'DESTINATION_ONE': 'DESTINATION_ONE',
  'ORIGIN': 'DESTINATION',
  'ORIGIN_ONE': 'DESTINATION_ONE'
};

// TODO: make dynamic based on environment
var baseUrl = 'http://localhost:8000/alexa/';

app.launch(function (req, res) {
  // TODO: grab the amazon userId and exchange for carvis userId
  fetch(baseUrl + 'launch', {
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

    res.say(app.prompt)
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
    'slots': slotsForTesting
  },
  function (req, res) {
    fetch(baseUrl + 'estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log('response from POST to /alexa/estimate:', data);
      res.say(data.prompt);
      if (data.reprompt) { res.reprompt(data.reprompt) }
      res.shouldEndSession(false)
        .send();
    })
    .catch(function (err) {
      console.log('ERROR posting to /alexa/estimate', err);
    });
    // Intent handlers that don't return an immediate response (because they
    // do some asynchronous operation) must return false
    return false;
  }
);

// Intents required by Amazon
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);
app.intent('AMAZON.HelpIntent', helpFunction);

var exitFunction = function (req, res) {
  var exitSpeech = 'Have a nice day!';
  res.say(exitSpeech);
};

var helpFunction = function (req, res) {
  res.say(helpSpeech);
};

module.exports = app;
