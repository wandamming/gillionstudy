define('framework/control/GillionFormatDirectiveConstructor', ['angular', 'underscore'], function (angular, _) {
    return function ($filter) {
        function format(value, filterName, params) {
            var filter = $filter(filterName),
                _params = angular.copy(params);
            if (_params) {
                _params.unshift(value);
            } else {
                _params = [];
                _params.unshift(value);
            }
            return filter.apply(null, _params);
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var gFormat = attrs.gFormat,
                    pattern = /'.+'|[^:]+/g,
                    index, name, subStr, params;
                if (gFormat) {
                    index = gFormat.indexOf(":");
                    if (index == -1) {
                        name = gFormat;
                    } else {
                        name = gFormat.substr(0, index);
                        subStr = gFormat.substr(index + 1);
                        if (subStr) {
                            params = subStr.match(pattern);
                            params = _.map(params, function (item) {
                                return item.replace(/'/g, "");
                            })
                        }
                    }

                    function formatter(value) {
                        if (element[0] == document.activeElement) {
                            return value;
                        }
                        if (value || value === 0) {
                            return format(value, name, params);
                        }
                        return value;
                    }


                    element.on("blur", function () {
                        var value = ngModel.$modelValue,
                            formatValue = format(value, name, params);
                        element.val(formatValue);
                    });
                    element.on("focus", function () {
                        element.val(ngModel.$modelValue);
                    });
                    ngModel.$formatters.push(formatter);
                }
            }
        }
    }
});