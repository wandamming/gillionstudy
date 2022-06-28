/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/17
 * Time: 8:25
 */
define('framework/utils/UtilsModule', [
        'angular',
        'framework/utils/ArraysConstructor',
        'framework/utils/DatesConstructor',
        'framework/utils/LocalStorageConstructor',
        'framework/utils/PredicatesConstructor',
        'framework/utils/FunctionsConstructor',
        'framework/utils/ZIndexConstructor',
        'framework/utils/AntPathMatcherConstructor',
        'angular-base64',
        'angular-local-storage'
    ],
    function (angular, ArraysConstructor, DatesConstructor, LocalStorageConstructor, PredicatesConstructor, FunctionsConstructor, ZIndexConstructor, AntPathMatcherConstructor) {
        return angular.module('UtilsModule', ['ng', 'LocalStorageModule', 'base64'], ['$provide', '$filterProvider', 'localStorageServiceProvider', "$base64", function ($provide, $filterProvider, localStorageServiceProvider, $base64) {

            $provide.factory('Arrays', ArraysConstructor);
            ArraysConstructor.$inject = ['$filter', 'Predicates'];

            $provide.factory('Dates', DatesConstructor);
            DatesConstructor.$inject = ['$filter'];

            $provide.factory('Base64Utils', function () {
                return $base64;
            });

            localStorageServiceProvider.setPrefix('gillion-web').setNotify(true, true);
            $provide.factory('LocalStorages', LocalStorageConstructor);
            LocalStorageConstructor.$inject = ['localStorageService'];

            $provide.factory('Predicates', PredicatesConstructor);
            $provide.factory('Functions', FunctionsConstructor);
            $provide.factory('ZIndex', ZIndexConstructor);
            $provide.factory('ZIndex', ZIndexConstructor);
            $provide.factory('AntPathMatcher', AntPathMatcherConstructor);
        }]);
    });