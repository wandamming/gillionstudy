define('framework/validation/IllegalMessagesConstructor', [
    'angular'
], function () {

    return function ($injector) {
        /**
         * 错误消息处理服务
         * @constructor
         */
        function IllegalMessages() {
            var me = this;
            me.messengers = {};
            me.started = false;
        }

        IllegalMessages.prototype = {

            /**
             * @param messengerName {String} 消息处理实例的类别名称
             */
            getMessenger: function (messengerName) {
                var messengers = this.messengers;
                if (!messengers.hasOwnProperty(messengerName)) {
                    if ($injector.has(messengerName)) {
                        messengers[messengerName] = $injector.get(messengerName);
                    } else {
                        throw new TypeError('未定义 [' + messengerName + '] 消息处理器。');
                    }
                }
                return messengers[messengerName];
            },

            send: function (messageParams) {
                var me = this,
                    formName = messageParams.formName,
                    messengerName = messageParams.messengerName,
                    messenger = me.getMessenger(messengerName);
                if (me.started) {
                    messenger.startValidForm(formName);
                    me.started = false;
                }

                messenger.handle(messageParams);
            },

            clear: function (messengerName, $target) {
                var messengers = this.messengers;
                if (messengers.hasOwnProperty(messengerName)) {
                    messengers[messengerName].clear($target);
                }
            },

            startValidForm: function () {
                this.started = true;
            }

        };

        return new IllegalMessages();
    };
});