# MumbleBot 3

A bot made to queue and play music into a mumble server. 

This was largely made for my own personal mumble server, so some of the features in the code base are of questionable utility

## Features
 - Web UI 
 - Supports music from both file upload and YouTube.
 - Can stream from radio stations (using data from http://radio.garden)
 - Voting on whether to queue a track

## Prerequisites:
 * Yarn
 * Node JS
 * MongoDB

## Installation/Getting Started:
 * Clone this repo
 * Chaneg to the repo's directory and get dependencies `yarn`
 * Build `yarn build`
 * Create some certificates `openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem`
 * Run MumbleBot 3 `yarn dev`
 * Site can be found at localhost:3000

## Roadmap

 - Finish pairing feature (will allow voting from the web app)