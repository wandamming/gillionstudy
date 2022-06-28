define(['angular'], function (angular) {
    return function () {
        return {
            sum: function (a, b) {
                return a + b;
            },

            /**
             * 创建方法引用的高级函数
             * @example
             * <ul>
             *     <li>Functions.funcRef(String.prototype.length)('abc') -> 3</li>
             *     <li>Functions.funcRef(String.prototype.toLowerCase)('ABC') -> 'abc'</li>
             *     <li>Functions.funcRef(Array.prototype.concat)([1, 2, 3], 4, 5, 6) -> [1, 2, 3, 4, 5, 6]</li>
             *     <li>Functions.funcRef(Number.prototype.toPrecision, 2)(30) -> 30.00</li>
             * </ul>
             * @param func
             * @returns {Function}
             */
            funcRef: function (func) {
                var linkArgs = Array.prototype.slice.call(arguments, 1);
                return function (elemnt) {
                    return func.apply(elemnt, linkArgs);
                }
            },

            newPropTransformer: function (propName) {
                return function (element) {
                    if (propName) {
                        var propTokens = propName.split('.'),
                            val = element;
                        angular.forEach(propTokens, function (propToken) {
                            if (val.hasOwnProperty(propToken)) {
                                val = element[propToken];
                            } else {
                                val = undefined;
                            }
                        });
                        if (val !== element) {
                            return val;
                        }
                    }
                };
            }
        }
    }
});