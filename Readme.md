# TDK
#### Theme Developer Kit for Toolkitt.com

[![Build Status](https://travis-ci.org/ben-ng/tdk.png?branch=master)](https://travis-ci.org/ben-ng/tdk)

[![Browser Support](https://ci.testling.com/ben-ng/tdk.png)](https://ci.testling.com/ben-ng/tdk)

## Design Philosphy

 * Facebook Not MySpace

    This is the guiding principle for everything we do here. After using many existing website builders and portfolio websites, it's clear that many have turned into intricate thousand-lever machines. This is the result of saying "yes" to too many features that solve issues not part of the original problem.

 * If You're Thinking Of Adding A Feature, Please Try Removing Two First

    The answer to "can I have feature X" is almost certainly "no". Even though Toolkitt is a very young product, its already got some rough edges. Instead of adding new features, we're going to polish what we have to a blinding shine. The best features are ones that replace clunky functionality we already have with something more elegant and beautiful.

 * Simple, Functional Design

    Our portfolios should be nothing more than a frame for our users' art. Controls should be visible when they are relevant, and disappear when they are not. There should be a consistent structure to every theme, so that users are not disorientated when they switch between them.

 * No Tutorials

    There was a tutorial in an earlier version of this site. After much consideration, I've concluded that if a feature needs a tutorial, it was badly designed. Design should be so obvious, it seems silly to have it any other way.

 * Lean UX

    We follow [Lean UX principles](http://www.amazon.com/UX-Lean-Startups-Experience-Research/dp/1449334911). It takes a minute or so to deploy new themes to our staging environment, and just a couple more to push those changes to every user on production. This means that we can test changes on live users in minutes and get immediate feedback from them.

## Overview

The backbone app in `_shared_sources` forms the core of every Toolkitt portfolio. On every deploy we browserify the Javascript, compile the LESS, and place the results into `_shared`.

Custom themes go in folders in the root. As of right now, the only theme is `basic`. Themes must minimally contain two files, `index.html` and `info.js`. Take a look at the `basic` folder to see minimal implementations of these two files.

When a portfolio is deployed, Toolkitt will merge the theme folder with the `_shared` folder, giving custom theme files priority. This means that at this point of time, only CSS and image replacements are possible.

In a few more weeks, we will merge themes with the `_shared_sources` folder instead, so that themes can override files before the packaging process starts. The main issue here is that packaging up a custom site for every user is computationally expensive.

## Project Structure

```
|-  _shared          // Where the portfolio app is built
|-  _shared_sources  // The actual portfolio code is here
  |- css             // CSS code from libraries
  |- less            // LESS code from libraries
    |- custom.less   // Where all our customizations are
  |- js              // Where the Backbone app is
    |- collections   // Backbone Collections
    |- config        // Config vars
    |- helpers       // Database, jQuery, Backbone, utility helpers
      |- lib         // jQuery plugins and other libraries
    |- models        // Backbone Models
    |- routes        // Routes handle naviagation events, usually loading up a view
    |- templates     // Handlebars templates that views use
    |- views         // Views handle things like responding to events and rendering templates
|
|-  _test            // The test app is built here
|-  _test_sources    // Where the test app sources are kept
```

## How To Develop

 * Install [node.js](http://nodejs.org)
 * `git clone https://github.com/ben-ng/tdk.git`
 * `cd tdk`
 * `jake NODE_ENV=staging`
 * Visit the portfolio running at `http://localhost:8080`
 * Go to the login page and provision a test account

#### Notes

 * Test accounts are cleaned up every hour, so just provision a new one when they expire
 * The theme will rebuild when javascript changes are detected, just refresh your browser after you see `Compiled at ...`
 * You will probably need to re-launch the app if you edit a handlebars template
 * Editing files in the middle of the rebuilding process can be glitchy, just relaunch the app
 * Stuck? Email me or [open an issue](https://github.com/ben-ng/tdk/issues)!

## CI

 * `jake tests=true` will test your theme on port 8080
 * `jake tests=true phantomjs=true` will test your theme on port 8080 with the phantomjs bridge
 * `jake tests=true testling=true` will test your theme on port 8080 printing TAP output to the console

All the above commands will watch the file tree and reload the page when neccessary via websockets.

```sh
# Install the Jake task runner
$ npm install -g jake

# To preview theme
$ jake
Watching _shared_sources for changes
 LESS Compiled (10 files)
 Resources Built
 Script Browserified
Compiled at Tue Jun 25 2013 00:10:00 GMT-0700 (PDT)
Server running on localhost:8080

# To run automated tests
$ jake tests=true --trace
Watching _shared_sources for changes
Watching _test_sources/scripts for changes
 LESS Compiled (11 files)
 Resources Built
 Tests Browserified
Compiled at Tue Jun 25 2013 00:10:00 GMT-0700 (PDT)
Server running on localhost:8080

# To do either of the above without watching the file tree
# and starting the web server you can also do

$ jake compile

# or

$ jake compile tests=true
```

## Before Commits
Run `jake compile minify=true environment=production` to update the _shared folder.
