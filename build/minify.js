/**
 * Builds a minify command from config
 */

var rootPath = process.cwd();

module.exports = function minifierCommand (config, amdUglifyFlags) {

  var sourceMapFlags = '';
  if (config.sourceMap) {
    if (config.minifier !== 'uglifyjs' && config.minifier !== 'closure') {
      console.log('[notice]: sourceMap support requires uglifyjs or google closure compiler as minifier; changed minifier to uglifyjs.');
      config.minifier = 'uglifyjs';
    }
    sourceMapFlags = config.minifier === 'uglifyjs' ? ' --source-map fabric.min.js.map' : ' --create_source_map fabric.min.js.map --source_map_format=V3';
  }

  var minifierCmd;
  if (config.minifier === 'yui') {
    minifierCmd = 'java -jar ' + rootPath + '/lib/yuicompressor-2.4.6.jar fabric.js -o fabric.min.js';
  }
  else if (config.minifier === 'closure') {
    minifierCmd = 'java -jar ' + rootPath + '/lib/google_closure_compiler.jar --js fabric.js --js_output_file fabric.min.js' + sourceMapFlags;
  }
  else if (config.minifier === 'uglifyjs') {
    minifierCmd = 'uglifyjs ' + amdUglifyFlags + ' --compress --mangle --output fabric.min.js fabric.js' + sourceMapFlags;
  }
  return minifierCmd;
}
