/**
 * Create a header comment for output from config
 */
module.exports = function (config) {
  return '/* build: `node build.js modules=' +
    config.modulesToInclude.join(',') +
    (config.modulesToExclude.length ? (' exclude=' + config.modulesToExclude.join(',')) : '') +
    (config.noStrict ? ' no-strict' : '') +
    (config.noSVGExport ? ' no-svg-export' : '') +
    (config.noES5Compat ? ' no-es5-compat' : '') +
    (config.requirejs ? ' requirejs' : '') +
    (config.sourceMap ? ' sourcemap' : '') +
    ' minifier=' + config.minifier +
  '` */';
};
