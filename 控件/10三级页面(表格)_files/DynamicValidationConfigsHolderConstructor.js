define('framework/validation/DynamicValidationConfigsHolderConstructor',
    ['underscore', 'config.properties', 'jquery'], function (_, config, $) {
        return function (ValidationHolder) {
            var dynamicConfigsGetterUrl = _.getValue(config, 'controls.validation.dynamicConfigsGetterUrl'),
                cache = {};

            return {

                /**
                 * @public
                 */
                get: function (groupName, messageKey) {
                    "use strict";
                    var me = this,
                        temp = cache;
                    if (!temp.hasOwnProperty(groupName)) {
                        var dynamicConfigs = ValidationHolder.__dynamicConfigsTransferStation[groupName];
                        if (dynamicConfigs) {
                            cache[groupName] = dynamicConfigs;
                            return dynamicConfigs[messageKey];
                        }else {
                            me.syncLoad(groupName);
                        }
                    }
                    temp = cache[groupName];
                    if (temp.hasOwnProperty(messageKey)) {
                        return temp[messageKey];
                    }
                },

                syncLoad: function (groupName) {
                    "use strict";
                    var rules = ValidationHolder.loadRules(groupName),
                        messageKeys;

                    if (rules) {
                        messageKeys = _(rules).chain()
                            .filter(_.property('dynamicConfiguration'))
                            .pluck('message')
                            .value();
                    }

                    var groupConfigs = null;
                    $.ajax({
                        url: dynamicConfigsGetterUrl,
                        method: 'GET',
                        data: {
                            groupName: groupName,
                            messageKeys: messageKeys
                        }
                    }).done(function (result) {
                        if (result && result.success === true) {
                            groupConfigs = result.data;
                            cache[groupName] = groupConfigs;
                        }
                    });
                    return groupConfigs;
                }
            };
        };
    });