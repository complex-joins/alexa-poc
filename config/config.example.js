// Create a copy of this file called config.js and put your API keys there
module.exports = {
  GOOGLE_PLACES_API_KEY: 'YOUR_API_KEY_HERE',
  LYFT_BEARER_TOKEN: 'YOUR_TOKEN_HERE',
  LYFT_USER_ID: 'YOUR_USER_ID_HERE'
};

// LYFT_BEARER_TOKEN is currently hardcoded and needs to be updated ~daily
// TODO: update dynamically

/* update manually via:
curl -X POST -H "Content-Type: application/json" \
   --user "LYFT_USER_ID" \
   -d '{"grant_type": "client_credentials", "scope": "public"}' \
   'https://api.lyft.com/oauth/token'
*/