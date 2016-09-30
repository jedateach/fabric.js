// extract build arguments
var buildArgs = process.argv.slice(2),
    buildArgsAsObject = { };

buildArgs.forEach(function(arg) {
  var key = arg.split('=')[0],
      value = arg.split('=')[1];

  buildArgsAsObject[key] = value;
});

module.exports = buildArgsAsObject;
