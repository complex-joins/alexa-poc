/* TODO:
-
-
-

/

*/

// function won't be used here - instead on webview.
// possible refactor to ES6 with React needed.

// endpoints, headers, body parameters.
var lyftMethods = require('lyftPrivateMethods');

var lyftPhoneAuth = function(phoneNumberString) {
  // user gives us his phone number, we fetch(url, {method: POST});
  // response irrelevant
  // lyftMethods.phoneAuthHeaders, lyftMethods.phoneAuthBody (function)
};

var lyftPhoneCodeAuth = function(fourDigitCode) {
  // user inputs 4 digit code, we fetch(url, {method: POST});
  // we take response and store in lyftPrivateMethods ?
  // lyftMethods.phoneCodeAuthHeaders, lyftMethods.phoneCodeAuthBody (function)
};
