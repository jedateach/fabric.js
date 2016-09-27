var fs = require('fs'),
    exec = require('child_process').exec;

var culledFilesList = require('./culled-files');

var buildArgs = process.argv.slice(2),
    buildArgsAsObject = { },
    rootPath = process.cwd();

buildArgs.forEach(function(arg) {
  var key = arg.split('=')[0],
      value = arg.split('=')[1];

  buildArgsAsObject[key] = value;
});

var buildSh = 'build-sh' in buildArgsAsObject;
var buildMinified = 'build-minified' in buildArgsAsObject;

var modulesToInclude = buildArgsAsObject.modules ? buildArgsAsObject.modules.split(',') : [];
var modulesToExclude = buildArgsAsObject.exclude ? buildArgsAsObject.exclude.split(',') : [];
var includeAllModules = (modulesToInclude.length === 1 && modulesToInclude[0] === 'ALL') || buildMinified;

function ifSpecifiedAMDInclude(srcDir, amdLib) {
  var supportedLibraries = ['requirejs'];
  if (supportedLibraries.indexOf(amdLib) > -1) {
    return srcDir + 'amd/' + amdLib + '.js';
  }
  return '';
}

var distributionPath = buildArgsAsObject.dest || 'dist/';
var minifier = buildArgsAsObject.minifier || 'uglifyjs';
var mininfierCmd;

var noStrict = 'no-strict' in buildArgsAsObject;
var noSVGExport = 'no-svg-export' in buildArgsAsObject;
var noES5Compat = 'no-es5-compat' in buildArgsAsObject;
var requirejs = 'requirejs' in buildArgsAsObject ? 'requirejs' : false;
var sourceMap = 'sourcemap' in buildArgsAsObject;

// set amdLib var to encourage later support of other AMD systems
var amdLib = requirejs;

// if we want requirejs AMD support, use uglify
var amdUglifyFlags = '';
if (amdLib === 'requirejs' && minifier !== 'uglifyjs') {
  console.log('[notice]: require.js support requires uglifyjs as minifier; changed minifier to uglifyjs.');
  minifier = 'uglifyjs';
  amdUglifyFlags = ' -r \'require,exports,window,fabric\' -e window:window,undefined ';
}

// if we want sourceMap support, uglify or google closure compiler are supported
var sourceMapFlags = '';
if (sourceMap) {
  if (minifier !== 'uglifyjs' && minifier !== 'closure') {
    console.log('[notice]: sourceMap support requires uglifyjs or google closure compiler as minifier; changed minifier to uglifyjs.');
    minifier = 'uglifyjs';
  }
  sourceMapFlags = minifier === 'uglifyjs' ? ' --source-map fabric.min.js.map' : ' --create_source_map fabric.min.js.map --source_map_format=V3';
}

if (minifier === 'yui') {
  mininfierCmd = 'java -jar ' + rootPath + '/lib/yuicompressor-2.4.6.jar fabric.js -o fabric.min.js';
}
else if (minifier === 'closure') {
  mininfierCmd = 'java -jar ' + rootPath + '/lib/google_closure_compiler.jar --js fabric.js --js_output_file fabric.min.js' + sourceMapFlags;
}
else if (minifier === 'uglifyjs') {
  mininfierCmd = 'uglifyjs ' + amdUglifyFlags + ' --compress --mangle --output fabric.min.js fabric.js' + sourceMapFlags;
}

var noSVGImport = (modulesToInclude.indexOf('parser') === -1 && !includeAllModules) ||
  modulesToExclude.indexOf('parser') > -1;

var buildHeader =
  '/* build: `node build.js modules=' +
    modulesToInclude.join(',') +
    (modulesToExclude.length ? (' exclude=' + modulesToExclude.join(',')) : '') +
    (noStrict ? ' no-strict' : '') +
    (noSVGExport ? ' no-svg-export' : '') +
    (noES5Compat ? ' no-es5-compat' : '') +
    (requirejs ? ' requirejs' : '') +
    (sourceMap ? ' sourcemap' : '') +
    ' minifier=' + minifier +
  '` */';

var distFileContents = buildHeader;

function appendFileContents(fileNames, callback) {

  (function readNextFile() {

    if (fileNames.length <= 0) {
      return callback();
    }

    var fileName = fileNames.shift();

    if (!fileName) {
      return readNextFile();
    }

    fs.readFile(__dirname + '/' + fileName, function (err, data) {
      if (err) {
        throw err;
      }
      var strData = String(data);
      if (noStrict) {
        strData = strData.replace(/"use strict";?\n?/, '');
      }
      if (noSVGExport) {
        strData = strData.replace(/\/\* _TO_SVG_START_ \*\/[\s\S]*?\/\* _TO_SVG_END_ \*\//g, '');
      }
      if (noES5Compat) {
        strData = strData.replace(/\/\* _ES5_COMPAT_START_ \*\/[\s\S]*?\/\* _ES5_COMPAT_END_ \*\//g, '');
      }
      if (noSVGImport) {
        strData = strData.replace(/\/\* _FROM_SVG_START_ \*\/[\s\S]*?\/\* _FROM_SVG_END_ \*\//g, '');
      }
      distFileContents += ('\n' + strData + '\n');
      readNextFile();
    });

  })();
}

// get a culled list of files, based on modules to include/exclude list
var filesToInclude = culledFilesList(modulesToInclude, modulesToExclude, includeAllModules, amdLib);

// build minified files
if (buildMinified) {
  for (var i = 0; i < filesToInclude.length; i++) {
    if (!filesToInclude[i]) {
      continue;
    }
    var fileNameWithoutSlashes = filesToInclude[i].replace(/\//g, '^');
    exec('uglifyjs -nc ' + amdUglifyFlags + filesToInclude[i] + ' > tmp/' + fileNameWithoutSlashes);
  }
}
else if (buildSh) {

  var filesStr = filesToInclude.join(' ');
  var isBasicBuild = modulesToInclude.length === 0;

  var minFilesStr = filesToInclude
    .filter(function(f) { return f !== '' })
    .map(function(fileName) {
      return 'tmp/' + fileName.replace(/\//g, '^');
    })
    .join(' ');

  var fileName = isBasicBuild ? 'fabric' : modulesToInclude.join(',');

  var escapedHeader = distFileContents.replace(/`/g, '\\`');
  var path = '../fabricjs.com/build/files/' + fileName + '.js';
  fs.appendFile('build.sh',
    'echo "' + escapedHeader + '" > ' + path + ' && cat ' +
    filesStr + ' >> ' + path + '\n');

  path = '../fabricjs.com/build/files/' + fileName + '.min.js';
  fs.appendFile('build.sh',
    'echo "' + escapedHeader + '" > ' + path + ' && cat ' +
    minFilesStr + ' >> ' + path + '\n')
}
else {
  // change the current working directory
  process.chdir(distributionPath);

  appendFileContents(filesToInclude, function() {
    fs.writeFile('fabric.js', distFileContents, function (err) {
      if (err) {
        console.log(err);
        throw err;
      }

      // add js wrapping in AMD closure for requirejs if necessary
      if (amdLib !== false) {
        exec('uglifyjs fabric.js ' + amdUglifyFlags + ' -b --output fabric.js');
      }

      if (amdLib !== false) {
        console.log('Built distribution to ' + distributionPath + 'fabric.js (' + amdLib + '-compatible)');
      }
      else {
        console.log('Built distribution to ' + distributionPath + 'fabric.js');
      }

      exec(mininfierCmd, function (error) {
        if (error) {
          console.error('Minification failed using', minifier, 'with', mininfierCmd);
          process.exit(1);
        }
        console.log('Minified using', minifier, 'to ' + distributionPath + 'fabric.min.js');

        if (sourceMapFlags) {
          console.log('Built sourceMap to ' + distributionPath + 'fabric.min.js.map');
        }

        exec('gzip -c fabric.min.js > fabric.min.js.gz', function (error) {
          if (error) {
            console.error('Minification failed using', minifier, 'with', mininfierCmd);
            process.exit(1);
          }
          console.log('Gzipped to ' + distributionPath + 'fabric.min.js.gz');
        });
      });

      // Always build requirejs AMD module in fabric.require.js
      // add necessary requirejs footer code to filesToInclude if we haven't before
      if (amdLib === false) {
        amdLib = 'requirejs';
        filesToInclude[filesToInclude.length] = ifSpecifiedAMDInclude(amdLib);
      }

      appendFileContents(filesToInclude, function() {
        fs.writeFile('fabric.require.js', distFileContents, function (err) {
          if (err) {
            console.log(err);
            throw err;
          }
          exec('uglifyjs fabric.require.js ' + amdUglifyFlags + ' -b --output fabric.require.js');
          console.log('Built distribution to ' + distributionPath + 'fabric.require.js (requirejs-compatible)');
        });
      });

    });
  });
}
