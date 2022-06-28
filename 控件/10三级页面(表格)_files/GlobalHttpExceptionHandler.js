/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/11
 * Time: 20:14
 */
define('framework/commons/GlobalHttpExceptionHandler', ['angular'], function (angular) {
    return angular.module('GlobalHttpExceptionHandler', [], function ($locationProvider, $httpProvider) {

        var interceptor = ['$rootScope', '$q', function (scope, $q) {

            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status;

                if (status == 403) {
                    // TODO
                    return;
                }
                if (status == 404) {
                    // TODO
                    return;
                }
                // otherwise
                return $q.reject(response);

            }

            return function (promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    });
});