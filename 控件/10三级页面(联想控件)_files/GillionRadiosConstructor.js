define('framework/control/GillionRadiosConstructor', ['angular'], function () {
    return function ($parse) {
        return {
            template: '<span> <label ng-repeat="record in source"> <input type="radio" ng-checked="checkedIdx === $index" ng-click="checkItem($event, record, $index)"/> {{displayGetter(record)}} &nbsp;&nbsp; </label> <input type="hidden"/> </span>',
            replace: true,
            scope: {
                source: '=',
                submitName: '@',
                submitModel: '@',
                valueProp: '@',
                displayExpress: '@',
                /**
                 * @param args
                 * @param args.record {Object} 当前选中的记录
                 * @param args.value {Object} 当前选中的值
                 * @param args.recIndex {Number} 当前选中的记录在 source 中的下标
                 * @param args.$event {Event}
                 * @return {false|*} 为 false 将终止操作
                 */
                onBeforeCheck: '&',
                /**
                 * @param args
                 * @param args.record 当前选中的记录
                 * @param args.value 当前选中的值
                 * @param args.recIndex 当前选中的记录在 source 中的下标
                 * @param args.$event
                 */
                onCheck: '&'
            },
            restrict: 'E',
            compile: function (tElement, tAttrs) {
                var $hidden = tElement.children(':hidden'),
                    submitModelExpress = '$parent.' + tAttrs.submitModel;
                if (tAttrs.hasOwnProperty('submitModel')) {
                    $hidden.attr('ng-model', submitModelExpress);
                }

                if (tAttrs.hasOwnProperty('submitName')) {
                    $hidden.attr('name', tAttrs.submitName);
                }

                return function (scope) {
                    var returnParamFn = function (arg) { return arg; },
                        valueGetter = !!scope.valueProp ? $parse(scope.valueProp) : returnParamFn,
                        submitValueSetter = $parse(submitModelExpress).assign,
                        onBeforeCheck = scope.onBeforeCheck = scope.onBeforeCheck || angular.noop,
                        onCheck = scope.onCheck = scope.onCheck || angular.noop;

                    scope.checkItem = function ($event, record, $index) {
                        var value = valueGetter(record),
                            eventParams = { $event: $event, record: record, recIndex: $index, value: value},
                            beforeCheckRtn = onBeforeCheck(eventParams);
                        if (beforeCheckRtn !== false) {
                            scope.checkedIdx = $index;
                            submitValueSetter(scope, value);
                            onCheck(eventParams);
                        } else {
                            $event.preventDefault();
                        }
                    };

                    scope.displayGetter = !!scope.displayExpress ? $parse(scope.displayExpress) : returnParamFn;
                }
            }
        };
    }
});