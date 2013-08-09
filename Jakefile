var lib = require('./jakelib')
  , path = require('path')
  , fs = require('fs')
  , utils = require('utilities')
  , _ = require('lodash')
  , clicolor      = require('cli-color')
  , server        = require('node-static')

  /* Logging convenience functions */
  , error         = clicolor.red.bold
  , success       = clicolor.green
  , info          = clicolor.blue

  , SRC_DIR = path.join(__dirname, 'src')
  , TEST_SRC_DIR = path.join(__dirname, 'test', 'src')
  , BUILD_DIR = path.join(__dirname, 'build')
  , TEST_BUILD_DIR = path.join(__dirname, 'test', 'build');

desc('Watches the source dir and recompiles on change, serves theme on localhost:8080');
task('serve', {async: true}, function (theme) {
  if(!theme) {
    throw new Error('You need to specify a theme, try serve[basic]');
    return complete();
  }

  var timeout
    , delay = 500
    , task = jake.Task.compile
    , serverStarted = false
    , fileServer
    , serveDir = tests ? TEST_BUILD_DIR : path.join(BUILD_DIR, theme)
    , tests = process.env.tests ? true : false
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8081})
    , clients = []
    , recompile = function () {
        clearTimeout(timeout);

        timeout = setTimeout( function () {
          clearTimeout(timeout);
          task.reenable(true);
          task.invoke();
        }, delay);
      };

  wss.on('connection', function(ws) {
    clients.push(ws);
    console.log(info(' A client connected to the testing server'));

    ws.on('message', function(message) {
        console.log(info(' Client message: ' + message));
    });
  });

  task.addListener('complete', function () {
    var clientsLeft = [];

    console.log(success('Compiled at ' + (new Date)));

    if(!serverStarted) {
      serverStarted = true;

      fileServer = new server.Server(serveDir, {cache: 1});

      require('http').createServer(function (request, response) {
        request.addListener('end', function () {
          fileServer.serve(request, response, function (err) {
            if(err) {
              console.log(error("Error serving " + request.url + " - " + err.message));
            }
          });
        }).resume();
      }).listen(8080);

      console.log(success('Server running on localhost:8080'));
    }

    /* Notify clients */
    _.each(clients, function (ws, index) {
      try {
        ws.send('reload');
        clientsLeft.push(ws);
      }
      catch(e) {
        console.log(info(' A client disconnected from the testing server'));
      }
    });

    clients = clientsLeft;
  });

  utils.file.watch(SRC_DIR, recompile);
  utils.file.watch(TEST_SRC_DIR, recompile);

  console.log(info('Watching ' + SRC_DIR + ' for changes'));
  if(tests) {
    console.log(info('Watching ' + TEST_SRC_DIR + ' for changes'));
  }

  recompile();
});

desc('Compiles all the themes');
task('compile', {async: true}, function () {
  var THEME_DIR = path.join(__dirname, 'src')
    , BUILD_DIR = path.join(__dirname, 'build')
    , BASE_DIR = path.join(THEME_DIR, '_shared')
    , themes
    , chain
    , todo
    , entryScript = path.join(BASE_DIR, 'js', 'index.js');

  // Clean the build dir
  utils.file.mkdirP(BUILD_DIR, {silent: true});
  utils.file.rmRf(BUILD_DIR, {silent: true});
  utils.file.mkdirP(BUILD_DIR, {silent: true});

  themes = fs.readdirSync(THEME_DIR);

  // Create async chain tasks
  todo = _
    // Remove hidden files
    .reject(themes, function(val) {
      var hiddenSigils = ['.','_'];
      return hiddenSigils.indexOf(val.charAt(0))>=0;
    })
    // Tack on dir paths
    .map(function (val) {
      return {
        inDir: path.join(THEME_DIR, val)
      , outDir: path.join(BUILD_DIR, val)
      , name: val
      };
    })
    .map(function (val) {
      return {
        func: lib.compile
      , args: [BASE_DIR, val.inDir, val.outDir, {entryScript: entryScript}]
      , callback: function (err) {
          if(err) {
            console.log('error building ' + val.name + ': ' + err);
          }
          else {
            console.log('built ' + val.name);
          }
        }
      };
    });

  // Compile each theme
  chain = new utils.async.AsyncChain(todo);
  chain.run();
});