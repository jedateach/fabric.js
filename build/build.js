var fs = require('fs');
var exec = require('child_process').exec;
var appendFileContents = require('./appender');
var culledFilesList = require('./culled-files');

// extract build arguments
var buildArgsAsObject = require('./cli');

// create config from build args
var config = require('./config')(buildArgsAsObject);

function ifSpecifiedAMDInclude(srcDir, amdLib) {
  var supportedLibraries = ['requirejs'];
  if (supportedLibraries.indexOf(amdLib) > -1) {
    return srcDir + 'amd/' + amdLib + '.js';
  }
  return '';
}

// set amdLib var to encourage later support of other AMD systems
var amdLib = config.requirejs;

// if we want requirejs AMD support, use uglify
var amdUglifyFlags = '';
if (amdLib === 'requirejs' && config.minifier !== 'uglifyjs') {
  console.log('[notice]: require.js support requires uglifyjs as minifier; changed minifier to uglifyjs.');
  config.minifier = 'uglifyjs';
  amdUglifyFlags = ' -r \'require,exports,window,fabric\' -e window:window,undefined ';
}

// create minifier command
var mininfierCmd = require('./minify')(config, amdUglifyFlags);

var buildHeader = require('./header')(config);

// get a culled list of files, based on modules to include/exclude list
var filesToInclude = culledFilesList(
  config.modulesToInclude,
  config.modulesToExclude,
  config.includeAllModules,
  amdLib
);

// build minified files
if (config.buildMinified) {
  for (var i = 0; i < filesToInclude.length; i++) {
    if (!filesToInclude[i]) {
      continue;
    }
    var fileNameWithoutSlashes = filesToInclude[i].replace(/\//g, '^');
    exec('uglifyjs -nc ' + amdUglifyFlags + filesToInclude[i] + ' > tmp/' + fileNameWithoutSlashes);
  }
}
// create build shell script
else if (config.buildSh) {

  var filesStr = filesToInclude.join(' ');
  var isBasicBuild = config.modulesToInclude.length === 0;

  var minFilesStr = filesToInclude
    .filter(function(f) { return f !== '' })
    .map(function(fileName) {
      return 'tmp/' + fileName.replace(/\//g, '^');
    })
    .join(' ');

  var fileName = isBasicBuild ? 'fabric' : config.modulesToInclude.join(',');

  var escapedHeader = buildHeader.replace(/`/g, '\\`');
  var path = '../fabricjs.com/build/files/' + fileName + '.js';
  fs.appendFile('build.sh',
    'echo "' + escapedHeader + '" > ' + path + ' && cat ' +
    filesStr + ' >> ' + path + '\n');

  path = '../fabricjs.com/build/files/' + fileName + '.min.js';
  fs.appendFile('build.sh',
    'echo "' + escapedHeader + '" > ' + path + ' && cat ' +
    minFilesStr + ' >> ' + path + '\n')
}
// normal build
else {
  // change the current working directory
  process.chdir(config.distributionPath);

  appendFileContents(filesToInclude, config, function(appendedFiles) {
    var distFileContents = buildHeader + appendedFiles;
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
        console.log('Built distribution to ' + config.distributionPath + 'fabric.js (' + amdLib + '-compatible)');
      }
      else {
        console.log('Built distribution to ' + config.distributionPath + 'fabric.js');
      }

      exec(mininfierCmd, function (error) {
        if (error) {
          console.error('Minification failed using', config.minifier, 'with', mininfierCmd);
          process.exit(1);
        }
        console.log('Minified using', config.minifier, 'to ' + config.distributionPath + 'fabric.min.js');

        if (config.sourceMap) {
          console.log('Built sourceMap to ' + config.distributionPath + 'fabric.min.js.map');
        }

        exec('gzip -c fabric.min.js > fabric.min.js.gz', function (error) {
          if (error) {
            console.error('Minification failed using', config.minifier, 'with', mininfierCmd);
            process.exit(1);
          }
          console.log('Gzipped to ' + config.distributionPath + 'fabric.min.js.gz');
        });
      });

      // Always build requirejs AMD module in fabric.require.js
      // add necessary requirejs footer code to filesToInclude if we haven't before
      if (amdLib === false) {
        amdLib = 'requirejs';
        filesToInclude[filesToInclude.length] = ifSpecifiedAMDInclude(amdLib);
      }

      appendFileContents(filesToInclude, config, function(appendedFiles) {
        var distFileContents = buildHeader + appendedFiles;
        fs.writeFile('fabric.require.js', distFileContents, function (err) {
          if (err) {
            console.log(err);
            throw err;
          }
          exec('uglifyjs fabric.require.js ' + amdUglifyFlags + ' -b --output fabric.require.js');
          console.log('Built distribution to ' + config.distributionPath + 'fabric.require.js (requirejs-compatible)');
        });
      });

    });
  });
}
