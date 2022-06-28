define('framework/control/GillionPrecisionDirectiveConstructor', [
    'angular',
    'framework/utils/JQueryEvents'
], function (angular, JQueryEvents) {
    return function () {
        return {
            restrict: 'A',
            require: '?^ngModel',
            link: function ($scope, element, $attrs, ngModel) {
                //noinspection JSUnresolvedVariable
                var precisionCount = Number($attrs.gPrecision),
                    rounding = $attrs.rounding !== 'false',
                    render = $attrs.render || 'true',
                    emptyZero = $attrs.emptyZero || 'false',
                    zeroFill = $attrs.zeroFill || 'true',
                    maxLength = Number($attrs.maxLength),
                    precision, setViewValue;

                setViewValue = function (value) {
                    if (value || value === 0) {
                        return precision(value);
                    }
                };

                if (ngModel && render === 'true') {
                    ngModel.$formatters.push(setViewValue);
                    ngModel.$parsers.push(setViewValue);
                    $scope.$watch($attrs.ngModel, function (value) {
                        if (value || value === 0) {
                            var modelValue = precision(value);
                            if (Number(value) != Number(modelValue)) {
                                ngModel.$setViewValue(modelValue);
                                if (angular.isDefined($attrs.ngBind)) {
                                    element.val(modelValue);
                                }
                            }
                        }
                    });
                }
                ;

                JQueryEvents.bindFirst(element, 'blur.precision', function () {
                    var newValue, oldValue = element.val();
                    if ((oldValue === "" || isNaN(oldValue)) && emptyZero === "true") {
                        oldValue = "0";
                    }
                    if (oldValue || oldValue === 0) {
                        newValue = precision(oldValue);
                        if (newValue !== oldValue) {
                            element.val(newValue);
                            if (ngModel) {
                                ngModel.$viewValue = newValue;
                            }
                        }
                    } else {
                        if (oldValue == "" && ngModel) {
                            ngModel.$setViewValue(undefined);
                        }
                    }
                });

                precision = function (value) {
                    var fixedString, precision, i, decimals, roundNum, index, numberVal, zeroFillLength = 0;
                    value = '' + value;
                    if (value.indexOf(",") != -1) value = value.replace(/,/g, "");
                    numberVal = Number(value);
                    if (!isNaN(numberVal) && !isNaN(precisionCount)) {
                        roundNum = Math.round(numberVal * Math.pow(10, precisionCount)) / Math.pow(10, precisionCount);
                        fixedString = '' + roundNum;
                        decimals = fixedString.split('.')[1] || '';
                        if (zeroFill === "true") {
                            /**add by zhanghf  2015-12-14 增加总长度限制的支持 end**/
                            if (!isNaN(maxLength)) {
                                zeroFillLength = maxLength - fixedString.length;
                                if (decimals === "") {
                                    zeroFillLength = zeroFillLength - 1;
                                }
                                zeroFillLength = zeroFillLength + decimals.length;
                                zeroFillLength = zeroFillLength > precisionCount ? precisionCount : zeroFillLength;
                            } else {
                                zeroFillLength = precisionCount;
                            }
                            if (decimals === "" && zeroFillLength > 0) {
                                fixedString += ".";
                            }
                            for (i = decimals.length; i < zeroFillLength; i++) {
                                fixedString += '0';
                            }
                        }
                        precision = value.split('.')[1] || '';
                        if (precision.length > precisionCount) {
                            if (rounding === false) {
                                var after = precision.substr(precisionCount, 1);
                                if (Number(after) >= 5) {
                                    if (precisionCount === 0) {
                                        fixedString = value.substr(0, value.length - precision.length + precisionCount - 1);
                                    } else {
                                        fixedString = value.substr(0, value.length - precision.length + precisionCount);
                                    }
                                }
                            }
                        }
                    } else {
                        fixedString = value;
                    }
                    return fixedString;
                };

            }
        }
    }
});