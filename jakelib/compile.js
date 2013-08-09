var utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , less  = require('less')
  , brwsify = require('browserify')
  , envify = require('envify/custom')
  , atob = require('atob')
  , uglify = require('uglify-js')
  , mold = require('mold-source-map')
  , concat = require('concat-stream')
  , sourcemap = require('source-map')
  , SMConsumer = sourcemap.SourceMapConsumer
  , SMGenerator = sourcemap.SourceMapGenerator
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

// Fixes warnings from the browserify prelude
fixSourcemapForPrelude = function (sourcemap) {
  var BROWSER_PACK_FILE = path.join(__dirname, '..', 'node_modules', 'browserify', 'node_modules', 'browser-pack', 'prelude.js')
    , preludeData = fs.readFileSync(BROWSER_PACK_FILE).toString()
    , consumer = new SMConsumer(sourcemap)
    , generator = SMGenerator.fromSourceMap(consumer)
    , srcFile = '/node_modules/browserify/node_modules/browser-pack/prelude.js';

  for(var i=0, ii=preludeData.length; i<ii; i++) {
    generator.addMapping({
      generated: {line:1, column: i}
    , original: {line:1, column: i}
    , source: srcFile
    , name: 'preludeCol' + i
    });
  }

  generator.setSourceContent(srcFile, preludeData)

  return generator.toString();
}

// Adds sourcecontent to sourcemap
enhanceSourcemapWithContent = function (inputmap, outputmap) {
  var output = JSON.parse(outputmap);

  output.sourcesContent = JSON.parse(inputmap).sourcesContent;

  return JSON.stringify(output);
};

// Separates code from sourcemap
decoupleBundle = function (src) {
  var marker = '//@ sourceMappingURL=data:application/json;base64,'
    , offset = src.indexOf(marker)
    , map = atob(src.substring(offset + marker.length));

  try {
    map = JSON.parse(map);
  }
  catch(e) {
    throw e;
  }

  return {
    code: src
  , map: JSON.stringify(map)
  };
};

/*
* Give it an input file and output dir, poof, JS!
*/
browserify = function (inputFile, output, cb) {
  var bundle = brwsify()
    , minified
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

  .pipe(mold.transformSourcesRelativeTo(path.dirname(inputFile)))

  .pipe(concat(function (outBuff) {
    outBuff = decoupleBundle(outBuff);

    utils.file.mkdirP(path.dirname(OUTPUT_FILE));

    outBuff.map = fixSourcemapForPrelude(outBuff.map)

    fs.writeFileSync(OUTPUT_MAP, outBuff.map);

    minBuff = uglify.minify(outBuff.code, {
        inSourceMap: OUTPUT_MAP,
        outSourceMap: 'js/scripts.min.map',
        fromString: true
    });

    minBuff.map = enhanceSourcemapWithContent(outBuff.map, minBuff.map);

    // Remove JS dir, no need for it anymore!
    utils.file.rmRf( path.dirname(OUTPUT_FILE) , {silent:true});

    fs.writeFileSync(OUTPUT_FILE, minBuff.code  + ';;;\n/*\n//@ sourceMappingURL=/js/scripts.map\n*/\n');
    fs.writeFileSync(OUTPUT_MAP, minBuff.map);

    cb();
  }));
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