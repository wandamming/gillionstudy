define('framework/validation/ValidationHolder', [
    'jquery',
    'require',
    'underscore',
    'config.properties'
], function ($, require, _, config) {
    var dynamicConfigsGetterUrl = _.getValue(config, 'controls.validation.dynamicConfigsGetterUrl'),
        $current = config.$paths.$config;

    return function () {

        var expressPattern = /\$\|(.*)\|/g;

        function getResourcePaths(groupName, validatorConfigValue) {
            var ctx = validatorConfigValue ? config.$paths[validatorConfigValue].path : $current.path;
            return [
                ctx + '/static/app/validation/generated/' + groupName + ".js",
                'i18n!' + ctx + '/static/app/nls/entity-' + groupName + ".js"
            ];
        }

        return {
            $rulesAndI18ns: {},

            __dynamicConfigsTransferStation: {},

            __fetchDynamicConfigs: function (groupName, rules) {
                var me = this,
                    messageKeys;
                if (me.__dynamicConfigsTransferStation.hasOwnProperty(groupName)) {
                    return;
                } else {
                    me.__dynamicConfigsTransferStation[groupName] = {};
                }
                if (rules) {
                    messageKeys = _(rules).chain()
                        .filter(_.property('dynamicConfiguration'))
                        .pluck('message')
                        .value();
                }
                $.ajax({
                    url: dynamicConfigsGetterUrl,
                    method: 'GET',
                    data: {
                        groupName: groupName,
                        messageKeys: messageKeys
                    }
                }).done(function (result) {
                    if (result && result.success === true) {
                        me.__dynamicConfigsTransferStation[groupName] = result.data;

                        var i18ns = me.$rulesAndI18ns[groupName].i18ns;
                        _(result.data).each(function (config, messageKey) {
                            var message = i18ns[messageKey],
                                config = result.data[messageKey],
                                newMessage;
                            if (expressPattern.test(message)) {
                                newMessage = message.replace(expressPattern, function (expr, token) {
                                    return config[token];
                                });
                                i18ns[messageKey + '_original'] = i18ns[messageKey];
                                i18ns[messageKey] = newMessage;
                            }
                        });
                    }
                });
            },

            /**
             *
             * @param groupName {String} ??????????????????
             * @param callback {function({rules:Object<String, ?>,i18ns:Array<String, String>}, async:boolean)} ??????????????????????????????????????????????????????
             */
            loadRulesAndI18ns: function (groupName, callback, validatorConfigValue) {
                var me = this,
                    rulesAndI18ns = me.$rulesAndI18ns,
                    resourcePaths;
                if (rulesAndI18ns.hasOwnProperty(groupName)) {
                    callback(rulesAndI18ns[groupName], false);
                    return rulesAndI18ns[groupName];
                } else {
                    resourcePaths = getResourcePaths(groupName, validatorConfigValue);
                    require(resourcePaths, function (rulesContent, i18ns) {
                        rulesAndI18ns[groupName] = {
                            rules: rulesContent.rules,
                            i18ns: i18ns
                        };
                        callback(rulesAndI18ns[groupName], true);
                        // ??????????????????????????? ?????????????????????
                        if (_(rulesContent.rules).any(_.property('dynamicConfiguration'))) {
                            me.__fetchDynamicConfigs(groupName, rulesContent.rules);
                        }
                    });
                }
            },

            /**
             *
             * @param groupName {String} ??????????????????
             * @param [callback] {function(rules:Object<String, ?>, async:boolean)} ??????????????????????????????
             * @return {boolean} ?????????`load`???
             */
            loadRules: function (groupName, callback, validatorConfigValue) {
                var rulesAndI18ns = this.loadRulesAndI18ns(groupName, function (rulesAndI18ns, async) {
                    callback(rulesAndI18ns.rules, async);
                }, validatorConfigValue);
                if (rulesAndI18ns) {
                    return rulesAndI18ns.rules;
                }
            },

            /**
             *
             * @param groupName {String} ??????????????????
             * @param [callback] {function(i18ns:Object<String, String>, async:boolean)} ???????????????????????????????????????
             * @return {boolean} ?????????`load`???
             */
            loadI18ns: function (groupName, callback, validatorConfigValue) {
                var rulesAndI18ns = this.loadRulesAndI18ns(groupName, function (rulesAndI18ns, async) {
                    callback(rulesAndI18ns.i18ns, async);
                }, validatorConfigValue);
                if (rulesAndI18ns) {
                    return rulesAndI18ns.i18ns;
                }
            }
        };
    };
});