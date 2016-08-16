# Carvis

Proof of concept app for the Carvis alexa skill.

## How to run this app
Follow these steps in order. 
1. Clone [Alexa-app-Server](https://github.com/complex-joins/alexa-app-server)
2. Run `npm install`
2. `cd` into `app-container/apps`. 
3. Clone Alexa-poc(this repo) into `apps` folder.
4. Run `npm install`
5. Move up one directory into `app-container` and run `node server`

## Issues

## Architecture
- Carvis runs on AWS with DockerCloud and DockerHub.
- Testing: Karma, Mocha, Chai, TravisCI.
- Node, Express, React, PostgreSQL, Redis
- Reverse engineering: Charles Proxy, SSL Kill Switch 2, APK Extraktor, APKtool.
