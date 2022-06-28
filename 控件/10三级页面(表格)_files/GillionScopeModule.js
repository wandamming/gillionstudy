define('framework/commons/GillionScopeModule', [
    'angular',
    'config.properties'
], function (angular, config) {
    return angular.module('GillionScopeModule', [])
        .run(function ($rootScope) {
            var $paths = config.$paths;
            if ($paths && angular.isObject($paths)) {
                $rootScope.$paths = angular.extend({}, $paths);
            }
        })
        .factory('Params', ['$rootScope', '$window', function ($rootScope, $window) {
            var href = $window.location.href,
                paramString = href.split('?')[1],
                params = {};
            if (!!paramString) {
                angular.forEach(paramString.split('&'), function (paramToken) {
                    var paramKeyValAry = paramToken.split('='),
                        key = paramKeyValAry[0],
                        val = decodeURIComponent(paramKeyValAry[1]);
                    if (!!params[key]) {
                        if (angular.isArray(params[key])) {
                            params[key].push(val);
                        } else {
                            params[key] = [params[key], val];
                        }
                    } else {
                        params[key] = val;
                    }
                });
            }
            $rootScope.params = params;
            return params;
        }]);
});