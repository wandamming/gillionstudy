/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/18
 * Time: 15:43
 */
define('framework/directive/GillionDirectiveModule', [
    'angular',
    'framework/directive/I18NLoaderConstructor',
    'framework/directive/GillionValidatorConstructor',
    'framework/directive/GillionResourceConstructor',
    'framework/directive/GillionCommonsQueryConstructor',
    'framework/directive/GillionCommonsSaveConstructor',
    'framework/directive/ControlValidatorServiceConstructor',
    'framework/directive/FieldValidatorDirectiveConstructor',
    'framework/validation/IllegalMessagesConstructor',
    'framework/validation/TooltipMessengerConstructor',
    'framework/validation/ValidationHolder',
    'framework/validation/ValidationErrorInterceptor',
    'framework/validation/ValidationErrorResponder',
    'framework/validation/DynamicValidationConfigsHolderConstructor',
    'framework/service/AssociatePromiseServiceConstructor',
    'framework/tooltip/GillionTooltipModule',
    'framework/msg/GillionMsgModule'
], function (angular,
             I18NLoaderConstructor,
             GillionValidatorConstructor,
             GillionResourceConstructor,
             GillionCommonsQueryConstructor,
             GillionCommonsSaveConstructor,
             ControlValidatorServiceConstructor,
             FieldValidatorDirectiveConstructor,
             IllegalMessagesConstructor,
             TooltipMessengerConstructor,
             ValidationHolder,
             ValidationErrorInterceptor,
             ValidationErrorResponder,
             DynamicValidationConfigsHolderConstructor,
             AssociatePromiseServiceConstructor) {
    return angular.module('GillionDirectiveModule', ['GillionTooltipModule', 'GillionMsgModule'],
        ['$compileProvider', '$provide', '$httpProvider', function ($compileProvider, $provide, $httpProvider) {

        $provide.factory('I18NLoader', I18NLoaderConstructor);
        $provide.factory('ControlValidatorService', ControlValidatorServiceConstructor);
        $provide.factory('ValidationHolder', ValidationHolder);
        $provide.factory('ValidationErrorResponder', ValidationErrorResponder);
        $provide.factory('DynamicValidationConfigsHolder', DynamicValidationConfigsHolderConstructor);

        $compileProvider.directive('gValidator', GillionValidatorConstructor);

        $compileProvider.directive('gResource', GillionResourceConstructor);

        $compileProvider.directive('gCommonsQuery', GillionCommonsQueryConstructor);

        $compileProvider.directive('gCommonsSave', GillionCommonsSaveConstructor);

        $compileProvider.directive('gFieldValidator', FieldValidatorDirectiveConstructor);

        $provide.factory('IllegalMessages', IllegalMessagesConstructor);
        $provide.factory('tooltipMessenger', TooltipMessengerConstructor);

        $httpProvider.interceptors.push(ValidationErrorInterceptor);

        $provide.service('AssociatePromiseService', AssociatePromiseServiceConstructor);

        //TODO ng-click防止多次触发 By wangjia
        // $provide.decorator('ngClickDirective',['$delegate','$timeout', function ($delegate, $timeout) {
        //     var original = $delegate[0].compile;
        //     var delay = 3000; //设置间隔时间
        //     $delegate[0].compile = function (element, attrs, transclude) {
        //         var disabled = false;
        //         function onClick(evt) {
        //             if (disabled) {
        //                 evt.preventDefault();
        //                 evt.stopImmediatePropagation();
        //             } else {
        //                 disabled = true;
        //                 $timeout(function () {
        //                     disabled = false;
        //                 }, delay, false);
        //             }
        //         }
        //         element.on('click', onClick);
        //         return original(element, attrs, transclude);
        //     };
        //     return $delegate;
        // }]);

    }]);
});
