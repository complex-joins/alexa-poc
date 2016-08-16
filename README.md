# Carvis

Proof of concept app for the Carvis alexa skill.

## How to run this app

Follow these steps in order:

1. Clone down [Alexa-App-Server](https://github.com/complex-joins/alexa-app-server)
2. Run `npm install`
3. `cd` into `app-container/apps`
4. Clone Alex-poc(this repo) into `app-container/apps`
5. Run `npm install`
6. At this point you need to make the decision on whether to save your .config file containing your private mathods/keys etc. in this repo or pull them from `Carvis-Web`. They need to be contained in a directory named `seceret` the lives in the root directory of this repo. 
7. `cd` up into `app-container` and run `node server`


## Issues

## Architecture
- Carvis runs on AWS with DockerCloud and DockerHub.
- Testing: Karma, Mocha, Chai, TravisCI.
- Node, Express, React, PostgreSQL, Redis
- Reverse engineering: Charles Proxy, SSL Kill Switch 2, APK Extraktor, APKtool.
