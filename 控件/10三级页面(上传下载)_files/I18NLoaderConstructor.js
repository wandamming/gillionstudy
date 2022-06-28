/**
 * Created with IntelliJ IDEA.
 * User: liaowj
 * Date: 2014/12/3
 * Time: 19:34
 */
define(['require'], function (require) {
    return function () {
        return {
            load: function (name, callback) {
                require(['i18n!nls/' + name], callback);
            }
        };
    }
});