// file locations
var baseDir = '../';
var libDir = baseDir + 'lib/';
var srcDir = baseDir + 'src/';

var files = require('./files')(srcDir, libDir);

function ifSpecifiedAMDInclude(srcDir, amdLib) {
  var supportedLibraries = ['requirejs'];
  if (supportedLibraries.indexOf(amdLib) > -1) {
    return srcDir + 'amd/' + amdLib + '.js';
  }
  return '';
}

/**
 * Reduce files list down to selected, based on modules.
 */
module.exports = function culledFilesList (modulesToInclude, modulesToExclude, includeAllModules, amdLib) {

  function ifSpecifiedInclude(moduleName, fileName) {
    var isInIncludedList = modulesToInclude.indexOf(moduleName) > -1;
    var isInExcludedList = modulesToExclude.indexOf(moduleName) > -1;

    // excluded list takes precedence over modules=ALL
    return ((isInIncludedList || includeAllModules) && !isInExcludedList) ? fileName : '';
  }

  function ifSpecifiedDependencyInclude(included, excluded, fileName) {
    return (
      (
        (modulesToInclude.indexOf(included) > -1 || includeAllModules) &&
        (modulesToExclude.indexOf(excluded) == -1))
      ? fileName : ''
    );
  }

  // cull based on modules
  files = files.map(function (file) {
    if (file.exclude && !ifSpecifiedDependencyInclude(file.include, file.exclude, file.path)) {
      return '';
    }
    if (file.include && !ifSpecifiedInclude(file.include, file.path)) {
      return '';
    }
    return file.path;
  });

  // amd include
  var amdInclude = ifSpecifiedAMDInclude('../src/', amdLib);
  if (amdInclude) {
    files.push(amdInclude);
  }

  // cull empties
  files = files.filter(function (file) {
    return Boolean(file);
  });

  return files;
};
