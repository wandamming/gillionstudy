// Generated by CoffeeScript 1.9.3
(function() {
    define('framework/unit/GillionUnitModule',
        ['angular','framework/unit/GillionUnitDirectiveConstructor'],
        function (angular,GillionUnitDirectiveConstructor) {
    var GillionUnitModule;
    GillionUnitModule = angular.module('GillionUnitModule', []);
    GillionUnitModule.directive("gUnit",GillionUnitDirectiveConstructor);
    return GillionUnitModule;
});
}).call(this);