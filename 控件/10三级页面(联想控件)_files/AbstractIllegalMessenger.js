define(['angular'], function (angular) {

    /**
     * 错误消息处理器
     * @abstract
     * @class AbstractIllegalMessenger
     * @constructor
     */
    function AbstractIllegalMessenger() {
    }

    AbstractIllegalMessenger.prototype = {

        /**
         * 处理表单控件错误信息
         *
         * @method
         * @abstract
         * @param msgParams 错误信息参数
         * @param msgParams.ruleName {String} 验证规则名称
         * @param msgParams.message {String} 错误信息
         * @param msgParams.$target {JQLite} 发送到的Dom元素的JQLite包装对象
         * @param msgParams.isValid {Boolean} 是否验证通过
         * @param msgParams.messengerName {String} 消息处理器名称
         * @param [msgParams.messageOpts] {Object} 验证消息显示的其它配置项
         * @param [msgParams.messageOpts.showLimit] {Number} 同时最多显示几条错误信息
         */
        handle: function (msgParams) {
        },

        /**
         * 表单验证时调用
         *
         * @method
         * @abstract
         * @param $target {JQLite} 需要清空错误信息的Dom元素的JQLite包装对象
         */
        startValidForm : function(formName){
        },

        finish: function (formName) {
        }
    };

    return AbstractIllegalMessenger;
});