define('framework/control/GillionControlDirectiveModule', [
    'angular',
    'config.properties',
    'framework/control/GillionTrimDirectiveConstructor',
    'framework/control/GillionPrecisionDirectiveConstructor',
    'framework/control/GillionDBCDirectiveConstructor',
    'framework/control/GillionUpperCaseDirectiveConstructor',
    'framework/control/GillionLowerCaseDirectiveConstructor',
    'framework/control/GillionDigitalSpinnerDirectiveConstructor',
    'framework/control/GillionNumericDirectiveConstructor',
    'framework/control/GillionCheckboxesConstructor',
    'framework/control/GillionRadiosConstructor',
    'framework/control/GillionWidthDirectiveConstructor',
    'framework/control/GillionHeightDirectiveConstructor',
    'framework/control/GillionCaseDirectiveConstructor',
    'framework/control/GillionPauseClickConstructor',
    'framework/control/GillionFormatDirectiveConstructor',
    'framework/control/GillionFocusSelectConstructor',
    'angular-placeholder'
], function (angular,
             config,
             GillionTrimDirectiveConstructor,
             GillionPrecisionDirectiveConstructor,
             GillionDBCDirectiveConstructor,
             GillionUpperCaseDirectiveConstructor,
             GillionLowerCaseDirectiveConstructor,
             GillionDigitalSpinnerDirectiveConstructor,
             GillionNumericDirectiveConstructor,
             GillionCheckboxesConstructor,
             GillionRadiosConstructor,
             GillionWidthDirectiveConstructor,
             GillionHeightDirectiveConstructor,
             GillionCaseDirectiveConstructor,
             GillionPauseClickConstructor,
             GillionFormatDirectiveConstructor,
             GillionFocusSelectConstructor) {

    //加载model前为html中所有input元素添加g-dbc属性
    if (!!config.html && !!config.html.input && config.html.input.gDbc) {
        angular.forEach(angular.element("input"), function (input) {
            input.setAttribute("g-dbc", "true");
        });
    }

    return angular.module('GillionControlDirectiveModule', ["html5.placeholder"], ['$compileProvider', function ($compileProvider) {
        $compileProvider.directive('gTrim', GillionTrimDirectiveConstructor);
        $compileProvider.directive('gPrecision', GillionPrecisionDirectiveConstructor);
        $compileProvider.directive('gDbc', GillionDBCDirectiveConstructor);
        GillionDBCDirectiveConstructor.$inject = ['$timeout'];
        $compileProvider.directive('gUpperCase', GillionUpperCaseDirectiveConstructor);
        $compileProvider.directive('gLowerCase', GillionLowerCaseDirectiveConstructor);
        $compileProvider.directive('gDigitalSpinner', GillionDigitalSpinnerDirectiveConstructor);
        GillionDigitalSpinnerDirectiveConstructor.$inject = ['$timeout', '$interval'];
        $compileProvider.directive('gNumeric', GillionNumericDirectiveConstructor);
        GillionNumericDirectiveConstructor.$inject = ['Arrays'];
        $compileProvider.directive('gCheckboxes', GillionCheckboxesConstructor);
        GillionCheckboxesConstructor.$inject = ['$parse'];
        $compileProvider.directive('gRadios', GillionRadiosConstructor);
        GillionRadiosConstructor.$inject = ['$parse'];
        $compileProvider.directive('gWidth', GillionWidthDirectiveConstructor);
        $compileProvider.directive('gHeight', GillionHeightDirectiveConstructor);
        $compileProvider.directive('gCase', GillionCaseDirectiveConstructor);
        $compileProvider.directive('gPauseClick', GillionPauseClickConstructor);
        $compileProvider.directive('gFormat', GillionFormatDirectiveConstructor);
        $compileProvider.directive('gFocusSelect', GillionFocusSelectConstructor);
    }]);

});