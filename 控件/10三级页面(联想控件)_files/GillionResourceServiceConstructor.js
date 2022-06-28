define('framework/commons/GillionResourceServiceConstructor', function () {
    return function ($q) {
        var resources = {};
        this.get = function (resourceName) {
            var deferred;
            if (!resources.hasOwnProperty(resourceName)) {
                resources[resourceName] = deferred = $q.defer();
                return deferred.promise;
            }
            return resources[resourceName];
        };
        this.set = function (resourceName, resource) {
            if (resources.hasOwnProperty(resourceName)) {
                resources[resourceName].resolve(resource);
            } else {
                var deferred;
                resources[resourceName] = deferred = $q.defer();
                setTimeout(function () {
                    deferred.resolve(resource);
                }, 5);
                return deferred.promise;
            }
        }
    }
});