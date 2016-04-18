'use strict';

angular.module('trikatuka2').service('RequestHelper', function ($q) {

    this.doAction = function (actionName, items, args) {
        var deferred = $q.defer();
        var ret = {
            success: [],
            fail: []
        };
        var process = function (index){
            if(items[index]) {
                return items[index][actionName].apply(items[index], args)
                    .then(function (result) {
                        ret.success.push(result);
                    }, function (result) {
                        ret.fail.push(result)
                    })
                    ['finally'](function () {
                        return process(index+1);
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
