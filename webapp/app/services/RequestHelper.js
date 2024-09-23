'use strict';

angular.module('trikatuka2').service('RequestHelper', function ($q) {

    this.doAction = function (actionName, items, args) {
        var deferred = $q.defer();
        var ret = {
            success: [],
            fail: []
        };
        var lastResult;
        var process = function (index, previousResult) {
            if (items[index]) {
                return items[index][actionName].apply(items[index], (args || []).concat(previousResult))
                    .then(function (result) {
                        lastResult = result;
                        ret.success.push(result);
                    }, function (result) {
                        lastResult = result
                        ret.fail.push(result)
                    })
                    ['finally'](function () {
                    return process(index + 1, lastResult);
                });
            }
            else {
                deferred.resolve(ret)
            }
        };
        process(0);
        return deferred.promise
    }

});
