/**
 * Created with IntelliJ IDEA.
 * User: liaowj
 * Date: 2014/12/11
 * Time: 8:41
 */
define('framework/date/GillionDateModule', [
    'angular',
    'framework/date/GillionDateConstructor',
    'framework/date/GillionDateRangeConstructor'
], function (angular, GillionDateConstructor, GillionDateRangeConstructor) {
    return angular.module('GillionDateModule', [], ['$compileProvider', function ($compileProvider) {
        $compileProvider.directive('gDate', GillionDateConstructor);
        $compileProvider.directive('gDateRange', GillionDateRangeConstructor);
    }]);
});