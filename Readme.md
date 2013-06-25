# TDK
#### Theme Developer Kit for Toolkitt.com

[![Build Status](https://travis-ci.org/ben-ng/tdk.png?branch=master)](https://travis-ci.org/ben-ng/tdk)

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