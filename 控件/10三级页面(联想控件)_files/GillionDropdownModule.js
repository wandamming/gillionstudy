/**
 * Created by linxh on 2015/5/29.
 */
define('framework/dropdown/GillionDropdownModule', [
    'angular',
    'framework/dropdown/GillionDropDownDirectiveConstructor',
    // 'framework/dropdown/GillionDropItemDirectiveConstructor',
    // 'framework/dropdown/GillionDropItemSelectAllDirectiveConstructor',
    'framework/snapshot/GillionLocationServiceConstructor',
    'framework/tabindex/TabindexModule',
    'framework/msg/GillionMsgModule',
    'angular-underscore'

], function (angular,GillionDropDownDirectiveConstructor,/*GillionDropItemDirectiveConstructor,GillionDropItemSelectAllDirectiveConstructor,*/GillionLocationServiceConstructor) {
    var GillionMessageModule = angular.module('GillionDropdownModule', ['TabindexModule','GillionMsgModule'], ['$compileProvider', function ($compileProvider) {
        // $compileProvider.directive('gDropitem',GillionDropItemDirectiveConstructor);
        $compileProvider.directive('gDropdown', GillionDropDownDirectiveConstructor);
        // $compileProvider.directive('gDropSelectAllitem', GillionDropItemSelectAllDirectiveConstructor);

    }]);
    GillionMessageModule.service('GillionLocationService',GillionLocationServiceConstructor);
    return GillionMessageModule;
})
