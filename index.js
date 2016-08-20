'use strict';
module.change_code = 1;
var _ = require('lodash');
var fetch = require('node-fetch');
var Alexa = require('alexa-app');
var app = new Alexa.app('carvis');
var config = require('./config');

var slotsForTesting = {
  'MODE': 'MODE',
  'DESTINATION': 'DESTINATION',
  'DESTINATION_ONE': 'DESTINATION_ONE',
  'ORIGIN': 'DESTINATION',
  'ORIGIN_ONE': 'DESTINATION_ONE'
};

var baseUrl = config.PROD ? 'http://54.183.205.82/alexa/' : 'http://localhost:8080/alexa/';
var applicationId = 'amzn1.ask.skill.7ff009fa-df68-4cd4-b6fd-9500d4791b42';

app.pre = function(req, res, type) {
  //Before req, make sure comes from Alexa skill
  console.log('amazon userId:', req.userId);
  var reqAppId = req.data.session.application.applicationId;
  if (reqAppId !== applicationId && config.PROD) {
    console.log('Invalid applicationId');
    res.fail('Invalid applicationId');
  }

  //check if carvis userId is stored in the session
  if(!req.session.carvisUserId) {
    // if no, exchange the amazon userId for carvis userId and store latter in session
    // move fetch call from app.launch to here
    fetch(baseUrl + 'launch/'+req.userId, {
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
      req.session.carvisUserId = data.carvisUserId;
      _.assignIn(app, data); // extend app object with config properties from data
    })
  }
};

app.launch(function (req, res) {
  res.say(app.prompt)
    .reprompt(app.reprompt)
    .shouldEndSession(false)
    .send()
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
      res.shouldEndSession(true)
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


var exitFunction = function (req, res) {
  var exitSpeech = 'Have a nice day!';
  res.say(exitSpeech).send();
};

var helpFunction = function (req, res) {
  res.say(app.helpSpeech).send();
};

// Intents required by Amazon
app.intent('AMAZON.StopIntent', exitFunction);
app.intent('AMAZON.CancelIntent', exitFunction);
app.intent('AMAZON.HelpIntent', helpFunction);

module.exports = app;
