/**
 * Create config object from arguments array
 */
module.exports = function (args) {

  var config = {
    buildSh: 'build-sh' in args,
    buildMinified: 'build-minified' in args,
    distributionPath: args.dest || 'dist/',
    minifier: args.minifier || 'uglifyjs',
    noStrict: 'no-strict' in args,
    noSVGExport: 'no-svg-export' in args,
    noES5Compat: 'no-es5-compat' in args,
    requirejs: 'requirejs' in args ? 'requirejs' : false,
    sourceMap: 'sourcemap' in args
  }

  // get list of modules to include or exclude
  config.modulesToInclude = args.modules ? args.modules.split(',') : [];
  config.modulesToExclude = args.exclude ? args.exclude.split(',') : [];
  config.includeAllModules = (config.modulesToInclude.length === 1 && config.modulesToInclude[0] === 'ALL')|| config.buildMinified;

  // set svg import config
  config.noSVGImport = (config.modulesToInclude.indexOf('parser') === -1 && !config.includeAllModules) ||
    config.modulesToExclude.indexOf('parser') > -1;

  return config;
};
