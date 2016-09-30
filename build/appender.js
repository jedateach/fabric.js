var fs = require('fs');

/**
 * Strips out specific parts of a file
 */
function strip (filedata, config) {
  var strData = String(filedata);
  if (config.noStrict) {
    strData = strData.replace(/"use strict";?\n?/, '');
  }
  if (config.noSVGExport) {
    strData = strData.replace(/\/\* _TO_SVG_START_ \*\/[\s\S]*?\/\* _TO_SVG_END_ \*\//g, '');
  }
  if (config.noES5Compat) {
    strData = strData.replace(/\/\* _ES5_COMPAT_START_ \*\/[\s\S]*?\/\* _ES5_COMPAT_END_ \*\//g, '');
  }
  if (config.noSVGImport) {
    strData = strData.replace(/\/\* _FROM_SVG_START_ \*\/[\s\S]*?\/\* _FROM_SVG_END_ \*\//g, '');
  }
  return strData;
}

/**
 * Concat files, stripping parts long the way
 */
module.exports = function appendFileContents(fileNames, config, callback) {

  var output = '';
  (function readNextFile() {
    if (fileNames.length <= 0) {
      return callback(output);
    }
    var fileName = fileNames.shift();
    if (!fileName) {
      return readNextFile();
    }
    fs.readFile(__dirname + '/' + fileName, function (err, data) {
      if (err) {
        throw err;
      }
      var strData = strip(data, config);
      output += ('\n' + strData + '\n');
      readNextFile();
    });
  })();
};
