define('framework/control/GillionCheckboxesConstructor', ['angular'], function () {
    return function ($parse) {
        return {
            template: '<span> <label ng-repeat="record in source"> <input type="checkbox" ng-click="checkedItem($event, record, $index)"/> {{displayGetter(record)}} &nbsp;&nbsp; </label> <input type="hidden"/> </span>',
            replace: true,
            scope: {
                source: '=',
                submitName: '@',
                submitModel: '@',
                valueProp: '@',
                displayExpress: '@',
                valueSeparator: '@',
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
                 * @param args.0
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

                return function (scope, element, attributes) {
                    var returnParamFn = function (arg) {
                            return arg;
                        },
                        valueGetter = !!scope.valueProp ? $parse(scope.valueProp) : returnParamFn,
                        valueSeparator = scope.valueSeparator || ',',
                        submitValueSetter = $parse(submitModelExpress).assign,
                        onBeforeCheck = scope.onBeforeCheck || angular.noop,
                        onCheck = scope.onCheck || angular.noop;

                    scope.checkedValues = [];

                    scope.$watchCollection('checkedValues', function (newVal) {
                        submitValueSetter(scope, newVal.join(valueSeparator));
                    });

                    scope.isChecked = function (record) {
                        return scope.checkedValues.indexOf(valueGetter(record)) !== -1;
                    };

                    scope.checkedItem = function ($event, record, $index) {
                        var value = valueGetter(record),
                            eventParams = {$event: $event, record: record, recIndex: $index, value: value},
                            checkedValues = scope.checkedValues,
                            valueIdx = checkedValues.indexOf(value),
                            onBeforeCheckRtn = onBeforeCheck(eventParams);

                        if (onBeforeCheckRtn !== false) {
                            if (valueIdx !== -1) {
                                checkedValues.splice(valueIdx, 1);
                            } else {
                                checkedValues.push(value);
                            }
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