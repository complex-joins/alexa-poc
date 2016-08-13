// Create a copy of this file called config.js and put your API keys there
module.exports = {
  UBER_SERVER_TOKEN: 'YOUR_UBER_TOKEN',
  GOOGLE_PLACES_API_KEY: 'YOUR_PLACES_KEY',
  LYFT_BEARER_TOKEN: 'YOUR_LYFT_TOKEN',
  LYFT_USER_ID: 'YOUR_LYFT_USER_ID'
};

/*
LYFT_BEARER_TOKEN currently hardcoded, needs to be updated every 86400 seconds.

TODO: update dynamically:
-- for updating one has to use the `refreshBearerToken` function from './../src/server/utils/lyft-helper.js'.

update manually via:
curl -X POST -H "Content-Type: application/json" \
   --user "LYFT_USER_ID" \
   -d '{"grant_type": "client_credentials", "scope": "public"}' \
   'https://api.lyft.com/oauth/token'
*/
