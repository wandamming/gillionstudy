/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/17
 * Time: 16:32
 */
define([], function () {
    return function (localStorageService) {
        return {
            set: function (key, val) {
                if (localStorageService.isSupported) {
                    return localStorageService.set(key, val);
                } else if (localStorageService.cookie.isSupported) {
                    return localStorageService.cookie.set(key, val);
                }
            },
            get: function (key) {
                if (localStorageService.isSupported) {
                    return localStorageService.get(key);
                } else if (localStorageService.cookie.isSupported) {
                    return localStorageService.cookie.get(key);
                }
            },
            keys: function () {
                if (localStorageService.isSupported) {
                    return localStorageService.keys();
                } else {
                    throw new ReferenceError('unsupported, must gte ie8');
                }
            },
            remove: function (key) {
                if (localStorageService.isSupported) {
                    return localStorageService.remove(key);
                } else if (localStorageService.cookie.isSupported) {
                    return localStorageService.cookie.remove(key);
                }
            },
            /**
             * @param {Regex} [regex]表达式
             * @return {*}
             */
            clearAll: function (regex) {
                if (localStorageService.isSupported) {
                    return localStorageService.clearAll(regex);
                } else if (localStorageService.cookie.isSupported) {
                    return localStorageService.cookie.clearAll();
                }
            },
            /**
             * 绑定`localStorage`与`scope`中的某属性
             * @param {Object} scope angular上下文
             * @param {String} prop  属性名称
             * @param {String} [value] 设置值
             * @param {String} [key] 对应`localStorage`中的属性名
             * @return {*|function(this:*)|function()} 撤销这个绑定的监听器
             */
            bind: function (scope, prop, value, key) {
                if (localStorageService.isSupported) {
                    return localStorageService.bind(scope, prop, value, key);
                } else {
                    throw new ReferenceError('unsupported, must gte ie8');
                }
            },
            length: function () {
                if (localStorageService.isSupported) {
                    return localStorageService.length();
                } else {
                    throw new ReferenceError('unsupported, must gte ie8');
                }
            }
        };
    }
})
;