define('framework/filters/GillionGlobalFiltersModule', [
    'angular',
    'framework/filters/SexToCnFilterConstructor',
    'framework/filters/DateFilterConstructor'
], function (angular, SexToCnFilterConstructor, DateFilterConstructor) {
    return angular.module('GillionGlobalFiltersModule', [], ['$filterProvider', function ($filterProvider) {
        $filterProvider.register('sexToCn', SexToCnFilterConstructor);
        $filterProvider.register('dateFormatter', DateFilterConstructor);
    }]);
});