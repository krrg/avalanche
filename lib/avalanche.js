var wkeys = require('when/keys');
var es6gen = require('when/generator');
var _ = require('lodash');

var Avalanche = (function() {

  var fork = es6gen.lift(function*(params) {
    var requests = params['requests'];
    // var fnRecover = params['fnRecover'] || Promise.
    var fnParse = params['fnParse'];
    var fnSpawn = params['fnSpawn'];
    var currentLevel = params['currentLevel'] || 0;
    var maxLevels = params['maxLevels'];

    // First fulfill all promises simultaneously.
    // TODO:  Does not handle being rejected very well.
    console.log("Waiting for request to fulfill.");
    var results = yield wkeys.all(requests);

    // Parse all results.
    var parsedResults = _.mapValues(results, function(value, key) { return fnParse(key, value); });

    // Check to see if we can advance levels
    var nextLevel = currentLevel + 1;
    if (nextLevel < maxLevels) {
      var spawnedRequests = fnSpawn(parsedResults, nextLevel);
      params['requests'] = spawnedRequests;
      params['currentLevel'] = nextLevel;
      var recursiveParsedResults = yield fork(params);  // Wait for subsequent levels to complete.
      return _.merge(parsedResults, recursiveParsedResults)
    }
    else {
      return parsedResults;
    }
  });

  return {
    fork: fork
  }

})();

module.exports = Avalanche;
