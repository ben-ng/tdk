# TDK
#### Theme Developer Kit for Toolkitt.com

[![Build Status](https://travis-ci.org/ben-ng/tdk.png?branch=master)](https://travis-ci.org/ben-ng/tdk)

[![Browser Support](https://ci.testling.com/ben-ng/tdk.png)](https://ci.testling.com/ben-ng/tdk)

## CI

We're set up for continuous development &amp; integration.

 *  `jake` will serve your theme on port 8080
 *  `jake tests=true` will test your theme on port 8080
 *  `jake tests=true phantomjs=true` will test your theme on port 8080 with the phantomjs bridge
 *  `jake tests=true testling=true` will test your theme on port 8080 printing TAP output to the console

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