  /* Modules */
var browserify    = require('browserify')
  , envify        = require('envify/custom')
  , _             = require('lodash')
  , path          = require('path')
  , utils         = require('utilities')
  , clicolor      = require('cli-color')
  , fs            = require('fs')
  , async         = require('async')
  , compressor    = require('node-minify')
  , less          = require('less')
  , server        = require('node-static')

  /* Logging convenience functions */
  , error         = clicolor.red.bold
  , success       = clicolor.green
  , info          = clicolor.blue

  /* Paths */
  , src           = path.relative(__dirname, '_shared_sources')
  , build         = path.relative(__dirname, '_shared')
  , buildJs       = path.join(build, 'js')
  , buildLess     = path.join(build, 'css')
  , buildJsFile   = path.join(build, 'js', 'scripts.js')
  , buildLessFile = path.join(build, 'css', 'styles.css')

  /* Test stuff */
  , testSrc       = path.relative(__dirname, '_test_sources')
  , testBuild     = path.relative(__dirname, '_test')
  , testScripts   = path.join(testSrc, 'scripts')
  , testFrameLess = path.join(testSrc, 'qunit', 'qunit.css')
  , testJsFile    = path.join(testBuild, 'tests.js')
  , testLessFile  = path.join(testBuild, 'styles.css')
  , qunitSelected = path.join(testSrc, 'qunit', process.env.phantomjs ? 'qunit.phantomjs.js' : (process.env.browserling ? 'qunit.testling.js' : 'qunit.unbridged.js'))
  , qunitBridge   = path.join(testSrc, 'qunit', 'qunit.selected.js')

  /* Handle test tasks */
  , tests         = process.env.tests ? true : false
  , lessFile      = tests ? testLessFile : buildLessFile

  /* LESS/CSS files, in order, relative to source dir */
  , lessFiles     = [
                      "css/video-js.css"
                    , "css/elastislide.css"
                    , "css/jquery.fancybox.css"
                    , "css/jquery.fancybox-buttons.css"
                    , "css/jquery.fancybox-thumbs.css"
                    , "css/bootstrap.css"
                    , "css/bootstrap-responsive.css"
                    , "less/flat-ui.less"
                    , "css/qunit.css"
                    , "css/guiders.css"
                    ];

/* Append source dir to LESS/CSS files */
lessFiles = _.map(lessFiles, function (filePath) {
  return path.join(src,filePath);
});

/* Add the testing framework's less file */
if(tests) {
  lessFiles = _.clone(lessFiles);
  lessFiles.push(testFrameLess);
}

/*
* Jake tasks follow
*/

desc('Watches the source dir and recompiles on change, serves theme on localhost:8080');
task('default', function () {

  var timeout
    , delay = 500
    , task = jake.Task.compile
    , serverStarted = false
    , fileServer
    , tests = process.env.tests?true:false
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

      fileServer = new server.Server(tests ? testBuild : build, {cache: 1});

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

  utils.file.watch(src, recompile);
  utils.file.watch(testScripts, recompile);

  console.log(info('Watching ' + src + ' for changes'));
  if(tests) {
    console.log(info('Watching ' + testScripts + ' for changes'));
  }

  recompile();
});

desc('Compiles the base theme into _shared');
task('compile', ['clean', build, buildLess, buildJs, testBuild, 'resources', 'browserify'], function () {
});

desc('Copies resources into _shared');
task('resources', [lessFile], function () {
  var toCopy =        [
                      'img'
                      , 'fonts'
                      , 'swf'
                      , 'helper.html'
                      , 'favicon.ico'
                      , 'index.html'
                      , 'apple-touch-icon.png'
                      , 'apple-touch-icon-57x57.png'
                      , 'apple-touch-icon-72x72.png'
                      , 'apple-touch-icon-114x114.png'
                      , 'apple-touch-icon-144x144.png'
                      , 'apple-touch-icon-precomposed.png'
                      ]
    , toCopyForTest = [
                      'img'
                      , 'fonts'
                      , 'swf'
                      , 'helper.html'
                      , 'favicon.ico'
                      , 'apple-touch-icon.png'
                      , 'apple-touch-icon-57x57.png'
                      , 'apple-touch-icon-72x72.png'
                      , 'apple-touch-icon-114x114.png'
                      , 'apple-touch-icon-144x144.png'
                      , 'apple-touch-icon-precomposed.png'
                      ]
    , testCopy =      ['index.html'];

  if(tests) {
    _.each(toCopyForTest, function (file) {
      utils.file.cpR(path.join(src,file), path.join(testBuild,file), {silent:true});
    });

    _.each(testCopy, function (file) {
      utils.file.cpR(path.join(testSrc,file), path.join(testBuild,file), {silent:true});
    });
  }
  else {
    _.each(toCopy, function (file) {
      utils.file.cpR(path.join(src,file), path.join(build,file), {silent:true});
    });
  }

  console.log(success(' Resources Built'));
});

desc('Compiles CSS and LESS');
file(lessFile, lessFiles, {async:true}, function () {
  var fileReaders = []
    , readFile = function (file) {
        fileReaders.push(function (next) {
          fs.readFile(file, next);
        });
      }
    , parser =  new (less.Parser)({
        paths: [path.join(src,'less')]  // Specify search paths for @import directives
      , filename: 'styles.css'          // Specify a filename, for better error messages
      });

  _.each(lessFiles, function (file) {
    readFile(file);
  });

  async.parallel(fileReaders, function(err, pieces) {
    if(err) {
      console.log(error(' Could not concat LESS: ' + err));
      complete();
    }
    else {

      parser.parse(Buffer.concat(pieces).toString(), function (err, tree) {
        var css = tree.toCSS();

        if(err) {
          console.log(error(' Could not compile LESS: ' + err));
          complete();
        }
        else {
          fs.writeFile(lessFile, css, function (err) {
            if(err) {
              console.log(error(' Could not writeout LESS: ' + err));
              complete();
            }
            else {
              if(process.env.minify) {
                new compressor.minify({
                    type: 'yui-css',
                    fileIn: lessFile,
                    fileOut: lessFile,
                    callback: function(err) {
                      if(err) {
                        console.log(error(' Could not compress LESS: ' + err));
                        complete();
                      }
                      else {
                        console.log(success(' LESS Compiled + Minified (' + lessFiles.length + ' files)'));
                        complete();
                      }
                    }
                });
              }
              else {
                console.log(success(' LESS Compiled (' + lessFiles.length + ' files)'));
                complete();
              }
            }
          });
          // /fs.writeFile
        }
        // endif
      });
      // /less.render
    }
  });
  // /async.parallel
});

desc('Browserifies the JS into _shared');
task('browserify', ['selectQunit'], {async:true}, function () {
  var handle
    , bundle
    , precompile = require('handlebars').precompile
    , handlebarsPlugin = function (body, file) {
        return 'var Handlebars = require(\'handlebars\');\nmodule.exports = ' + precompile(body) + ';';
      }
    , target = tests ? testJsFile : buildJsFile
    , finalTarget = target
    , targetMap =  finalTarget + '.map';

  if(process.env.minify) {
    // A temp file for minification
    target = target + '.out';
  }

  bundle = browserify();
  bundle.transform(require('hbsfy'));
  bundle.transform(envify({
    NODE_ENV: process.env.NODE_ENV
  , STAGING_PASS: process.env.STAGING_PASS
  , CI: process.env.CI
  }));

  bundle.require('jquery-browserify');

  if(tests) {
    if(process.env.testling) {
      bundle.add('./'+path.join(testSrc, 'scripts', 'index.testling.js'));
    }
    else {
      bundle.add('./'+path.join(testSrc, 'scripts', 'index.js'));
    }
  }
  else {
    bundle.add('./'+path.join(src, 'js', 'app', 'index.js'));
  }

  bundle.bundle({debug: true}, function (err, src) {
    if(err) {
      console.log(' Could not browserify: ' + error(err));
      complete();
    }
    else {
      fs.writeFileSync(target, src);

      if(process.env.minify) {
        new compressor.minify({
            type: 'gcc'
          , fileIn: target
          , fileOut: finalTarget
          , options: ['--create_source_map="' + targetMap + '"']
          , callback: function(err) {
              if(err) {
                console.log(error(' Could not compress JS: ' + err));
                complete();
              }
              else {

                // remove temp file
                fs.unlinkSync(target);

                // Add source mapping URL
                handle = fs.createWriteStream(finalTarget, {flags: 'a'});
                handle.end('/*\n//# sourceMappingURL='+path.basename(targetMap)+'\n*/');

                console.log(success(' '+(tests?'Tests':'Script')+' Browserified + Minified'));
                complete();
              }
            }
        });
      }
      else {
        console.log(success(' '+(tests?'Tests':'Script')+' Browserified'));
        complete();
      }
    }
  });
});

desc('Selects the bridged or unbridged QUnit');
task('selectQunit', function () {
  utils.file.cpR(qunitSelected, qunitBridge, {silent:true});
});

desc('Cleans the _shared directory');
task('clean', function () {
  utils.file.rmRf(build, {silent: true});
  utils.file.rmRf(testBuild, {silent: true});
  utils.file.rmRf(testLessFile, {silent: true});
  utils.file.rmRf(qunitBridge, {silent: true});
});

desc('Creates the build directory');
directory(build);

desc('Creates the JS build directory');
directory(buildJs);

desc('Creates the LESS build directory');
directory(buildLess);

desc('Creates the test build directory');
directory(testBuild);