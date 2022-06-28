/**
 * Created by linxh on 2015/5/29.
 */
define('framework/tooltip/GillionTooltipModule', [
    'angular',
    'framework/tooltip/GillionTooltipDirectiveConstructor',
    'framework/tooltip/GillionTooltipServiceConstructor',
    'framework/snapshot/GillionLocationServiceConstructor'

], function (angular, GillionTooltipDirectiveConstructor,GillionTooltipServiceConstructor,GillionLocationServiceConstructor) {
    var GillionTooltipModule = angular.module('GillionTooltipModule', [], ['$compileProvider', function ($compileProvider) {
        $compileProvider.directive('gTooltip', GillionTooltipDirectiveConstructor);
    }]);
    GillionTooltipModule.service('GillionLocationService',GillionLocationServiceConstructor);
    GillionTooltipModule.service('GillionTooltipService',GillionTooltipServiceConstructor);

    /*GillionTooltipModule.controller("TestController",["$scope",function($scope){
        var msgParams = {
            'ruleName':"rule1",
            'message':"错误信息1",
            'isValid':false,
            '$target':''

        }

        var msgParams2 = {
            'ruleName':"rule2",
            'message':"错误信息2",
            'isValid':false,
            '$target':''

        }

        var tar ;

        $scope.click = function($event){

            var btn = angular.element( $event.target);
            tar = btn;
                msgParams.$target = btn;
            IllegalMessengerServiceImpl.handle(msgParams);
        }

        $scope.click2 = function($event){
            msgParams2.$target = tar;
            IllegalMessengerServiceImpl.handle(msgParams2);
        }

        $scope.click3 = function($event){
            msgParams2.$target = tar;
            IllegalMessengerServiceImpl.clear(tar);
        }
    }]);*/

    return GillionTooltipModule;
})
