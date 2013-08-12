var utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , less  = require('less')
  , brwsify = require('browserify')
  , envify = require('envify/custom')
  , minifyify = require('../../minifyify')
  , _ = require('lodash')
  , TEMP_DIR = path.join(__dirname, 'tmp')
  , lessify
  , browserify
  , enhanceSourcemapWithContent
  , fixSourcemapForPrelude
  , decoupleBundle
  , compile;

/*
* Give it an input dir and output dir, poof, CSS!
*/
lessify = function (input, output, cb) {
  var LESS_DIR = path.join(input, 'less')
    , CSS_DIR = path.join(LESS_DIR, 'css')
    , OUTPUT_FILE = path.join(output, 'css', 'styles.css')
    , INDEX_FILE = path.join(LESS_DIR, 'index.less')
    , parser = new (less.Parser)({
        paths: [LESS_DIR],
        filename: 'index.less'
      })
    , inBuff
    , outBuff;

    inBuff = fs.readFileSync(INDEX_FILE).toString();

    parser.parse(inBuff
      , function (e, tree) {
        if(e) {
          return cb(e);
        }

        outBuff = tree.toCSS({ compress: true });

        utils.file.mkdirP(path.dirname(OUTPUT_FILE));

        // Delete the LESS dir, no need for it anymore!
        utils.file.rmRf( LESS_DIR , {silent:true});

        fs.writeFileSync(OUTPUT_FILE, outBuff);

        cb();
    });
};

/*
* Give it an input file and output dir, poof, JS!
*/
browserify = function (inputFile, output, cb) {
  var bundle = brwsify()
    , minified
    , opts = {
        file: '/js/scripts.js'
      , map: '/js/scripts.map'
      , compressPaths: function (p) { return path.relative(path.dirname(inputFile), p); }
      }
    , OUTPUT_FILE = path.join(output, 'js', 'scripts.js')
    , OUTPUT_MAP = path.join(output, 'js', 'scripts.map');

  bundle.transform(require('hbsfy'));
  bundle.transform(envify({
    NODE_ENV: process.env.NODE_ENV
  , STAGING_PASS: process.env.STAGING_PASS
  , CI: process.env.CI
  }));

  bundle.add(inputFile);

  bundle.bundle({debug: true})
  .on('error', function (err) { console.error(err); })
  .pipe(minifyify(function (code, map) {
    // Remove JS dir, no need for it anymore!
    //utils.file.rmRf( path.dirname(OUTPUT_FILE) , {silent:true});
    utils.file.mkdirP(path.dirname(OUTPUT_FILE));

    fs.writeFileSync(OUTPUT_FILE, code);
    fs.writeFileSync(OUTPUT_MAP, map);

    cb();
  }, opts));
  /*
  .pipe(require('concat-stream')(function (data) {
    fs.writeFileSync(OUTPUT_FILE, data);
    cb();
  }));
  */
}

/**
* Give it theme dirs, it'll spit out a compiled theme
*/
compile = function (base, input, output, opts, cb) {
  var defaults = {
    entryScript: false
  };

  if(!cb) {
    cb = opts;
    opts = {};
  }

  opts = opts || {};
  opts = utils.enhance({}, defaults, opts);

  if(!opts.entryScript) {
    return cb(new Error('please specify an entryScript in compile opts'));
  }

  // Wipe/create temporary directory
  utils.file.mkdirP(TEMP_DIR, {silent: true});
  utils.file.rmRf(TEMP_DIR, {silent: true});
  utils.file.mkdirP(TEMP_DIR, {silent: true});

  // Copy in base theme
  utils.file.cpR(base
    , path.dirname(TEMP_DIR)
    , {
        rename: path.basename(TEMP_DIR)
      , silent: true
      });

  // Copy in override theme
  utils.file.cpR(input
    , path.dirname(TEMP_DIR)
    , {
        rename: path.basename(TEMP_DIR)
      , silent: true
      });

  // Compile LESS
  lessify(TEMP_DIR, output, function (err) {
    if(err) {
      return cb(err);
    }

    // Copy out to build dir
    utils.file.cpR(TEMP_DIR
      , path.dirname(output)
      , {
        rename: path.basename(output)
        , silent: true
        });

    // Compile JS
    browserify(opts.entryScript, output, function (err) {
      if(err) {
        return cb(err);
      }

      // Delete temp dir
      utils.file.rmRf(TEMP_DIR, {silent:true});

      cb();
    });
  });
};

module.exports = compile;