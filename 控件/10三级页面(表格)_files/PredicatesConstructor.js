/**
 * @namespace utils.Predicates
 * 配合 {@link utils.ArraysConstructor} 使用
 * Arrays.filter(source, Predicates.newPropValEqPredicate('propName', val));
 *
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/18
 * Time: 16:59
 */
define(['angular'], function (angular) {
    return function () {
        return {
            /**
             * 属性相等的匹配器
             * @param {String} propName 属性名称
             * @param {Object} val 要比较的值
             * @return {function(Object):boolean} Predicate
             */
            newPropValEqPredicate: function (propName, val) {
                return this.newPropPredicate(propName, this.newEqPredicate(val));
            },
            newPropPredicate: function (propName, predicate) {
                return function (element) {
                    if (element && element.hasOwnProperty(propName)) {
                        return predicate(element[propName]);
                    }
                    return false;
                }
            },
            newEqPredicate: function (value) {
                return function (element) {
                    return angular.equals(value, element);
                }
            },
            not: function (predicate) {
                return function (element) {
                    return !predicate(element);
                };
            },

            or: function () {
                var predicates = Array.prototype.slice.call(arguments, 0);
                return function (element) {
                    var predicate, i, len;
                    for (i = 0, len = predicates.length; i < len; i++) {
                        predicate = predicates[i];
                        if (predicate(element) === true) {
                            return true;
                        }
                    }
                    return false;
                };
            },

            and: function () {
                var predicates = Array.prototype.slice.call(arguments, 0);
                return function (element) {
                    var predicate, i, len;
                    for (i = 0, len = predicates.length; i < len; i++) {
                        predicate = predicates[i];
                        if (!predicate(element)) {
                            return false;
                        }
                    }
                    return true;
                };
            },

            notEmpty: function (element) {
                if (angular.isUndefined(element) || element === null) {
                    return false;
                } else if (angular.isNumber(element)) {
                    return isNaN(element);
                } else if (angular.isString(element)) {

                }
            }
        }
    }
});