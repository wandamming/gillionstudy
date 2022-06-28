define('framework/directive/ControlValidatorServiceConstructor', [
        'angular',
        'jquery',
        'underscore',
        'framework/directive/ControlValidator',
        'config.properties',
        'framework/msg/GillionMsgModule'
    ], function (angular, $, _, ControlValidator, config) {
        var requireDisabledInGrid = _.getValue(config, 'controls.dataGrid.validation.requireDisabled', false),
            verifyOnSubmit = _.getValue(config, 'controls.validation.verifyOnSubmit', false);
        return function (Arrays, Predicates, $http, $timeout, $q, IllegalMessages, ValidationHolder, DynamicValidationConfigsHolder, GillionMsg) {
            var prototypeRef = ControlValidator.prototype;

            var CONTROL_RULE_DEFERREDS = {
                _cache: {},
                add: function (formName, modelControl, rule, deferred) {
                    var cache = this._cache;
                    if (!cache[formName]) {
                        cache[formName] = {};
                    }
                    if (!cache[formName][modelControl]) {
                        cache[formName][modelControl] = {};
                    }
                    if (!cache[formName][modelControl][rule]) {
                        cache[formName][modelControl][rule] = [];
                    }
                    cache[formName][modelControl][rule].push(deferred);
                },
                removeDeferreds: function (formName, modelControl, rule) {
                    var cache = this._cache;
                    cache[formName][modelControl][rule] = [];
                },
                getDeferreds: function (formName, modelControl, rule) {
                    var cache = this._cache,
                        result;
                    if (cache[formName] && cache[formName][modelControl])
                        result = cache[formName][modelControl][rule];
                    return result;
                }
            };
            prototypeRef.fillListenControls = function () {
                var me = this,
                    listenProperties = me.getListenProperties(),
                    listenControls = me.listenControls = [];

                if (me.isCombineRule()) {
                    angular.forEach(listenProperties, function (prop) {
                        Arrays.pushAll(me.getCombineMatchedControls(prop), listenControls);
                    });
                } else if (me.isMultiField()) {
                    angular.forEach(listenProperties, function (prop) {
                        Arrays.pushAll(me.getMultiFieldMatchedControls(prop), listenControls);
                    });
                } else {
                    me.listenControls = Arrays.transform(listenProperties, function (prop) {
                        return me.form[prop];
                    });
                }
                return me;
            };

            prototypeRef.fillListenControlsTargets$ = function () {
                var me = this;
                angular.forEach(me.listenControls, function (listenControl) {
                    if (listenControl) {
                        me.fillListenControlTargets$(listenControl);
                    }
                });
                return me;
            };

            /**
             * @private
             */
            prototypeRef.fillListenControlTargets$ = function (listenControl) {
                var me = this,
                    $form = me.$form,
                    controlName = listenControl.$name,
                    rule = me.rule,
                    $listenPropTargetCache = me.$listenPropTargetCache,
                    $outerContainerCache = me.$outerContainerCache,
                    $verifyTargetCache = me.$verifyTargetCache,
                    msgControl, $msgTarget;
                if (me.isOverrideListens() && rule.property) {
                    msgControl = me.getSameCombineControl(listenControl, rule.property);
                    $msgTarget = $listenPropTargetCache[controlName] = $form.find('[name=\'' + msgControl.$name + '\']')
                }else {
                    $msgTarget = $listenPropTargetCache[controlName] = $form.find('[name=\'' + controlName + '\']')
                }

                if(!$msgTarget) return;
                // 默认与 $target 一致
                $outerContainerCache[controlName] = $verifyTargetCache[controlName] = $msgTarget;
                if ($msgTarget.is('[outer-container]')) {
                    $outerContainerCache[controlName] = $msgTarget.parent().closest('[outer-container]');
                }
                if ($msgTarget.is('[verify-target]')) {
                    $verifyTargetCache[controlName] = $msgTarget.find('[verify-target]');
                }
            };

            prototypeRef.isOverrideListens = function () {
                return this.rule.listenProperties;
            };

            prototypeRef.getListenProperties = function () {
                var me = this,
                    rule = me.rule;
                if (me.isOverrideListens()) {
                    return rule.listenProperties;
                } else if (rule.property) {
                    return [rule.property];
                } else if (rule.properties) {
                    return rule.properties;
                }
                return [];
            };

            prototypeRef.getMsgTargetProperties = function () {
                var rule = this.rule;
                if (rule.property) {
                    return [rule.property];
                } else if (rule.properties) {
                    return rule.properties;
                }
                return [];
            };

            prototypeRef.isMultiField = function () {
                return this.rule.isMultiField;
            };

            prototypeRef.getMultiFieldMatchedControls = function (prop) {
                var me = this,
                    rule = me.rule,
                    form = me.form,
                    matchedControls = [],
                    subPro,
                    reg;
                if (prop) {
                    subPro = rule.subProperty;
                    reg = new RegExp('^' + prop + '(\\\[\\\d+\\\])?\.' + subPro + '$');
                    angular.forEach(form, function (control, fieldName) {
                        if (!(fieldName === 'verify' || /^\$/.test(fieldName)) && reg.test(fieldName)) {
                            matchedControls.push(control);
                        }
                    })
                }
                return matchedControls;
            };

            prototypeRef.isCombineRule = function () {
                return this.rule.combineName;
            };

            prototypeRef.getCombineMatchedControls = function (prop) {
                var me = this,
                    rule = me.rule,
                    combineName = rule.combineName,
                    form = me.form,
                    matchedControls = [],
                    reg;
                if (prop) {
                    reg = new RegExp('^' + combineName + '(\\\[\\\d+\\\])?\.' + prop + '$');
                    angular.forEach(form, function (control, fieldName) {
                        if (!(fieldName === 'verify' || /^\$/.test(fieldName)) && reg.test(fieldName)) {
                            matchedControls.push(control);
                        }
                    })
                }
                return matchedControls;
            };

            prototypeRef.assertListen = function (modelControl, rule) {
                if (!modelControl) return false;
                if (rule.property === modelControl.$name) return true;
                if (rule.combineName) {
                    if (rule.property) {
                        if (rule.combineName + "." + rule.property === modelControl.$name) {
                            return true;
                        }
                        if ((new RegExp('^' + rule.combineName + '(\\\[\\\d+\\\])?\.' + rule.property + '$')).test(modelControl.$name)) {
                            return true;
                        }
                    } else {
                        var flag = _.every(rule.properties, function (property) {
                            return rule.combineName + "." + property === modelControl.$name ||
                                (new RegExp('^' + rule.combineName + '(\\\[\\\d+\\\])?\.' + property + '$')).test(modelControl.$name)
                        });
                        if (flag) return true;
                    }
                }
                if (rule.combineName && rule.combineName + "." + rule.property === modelControl.$name) return true;
                if (_.contains(rule.properties, modelControl.$name)) return true;
                if (_.contains(rule.listenProperties, modelControl.$name)) return true;
                return false;
            };

            prototypeRef.apply = function () {
                var me = this,
                    gValidator = me.gValidator,
                    currentGroupVerifyFns = gValidator.getCurrentGroupVerifyFns(),
                    listenControls = me.listenControls,
                    rule = me.rule,
                    ruleName = me.ruleName,
                    formName = me.form.$name;
                if (Arrays.isNotEmptyArray(listenControls)) {
                    angular.forEach(listenControls, function (modelControl) {
                        if (me.assertListen(modelControl, rule)) {
                            var rulePredicate = me[ruleName],
                                $name = modelControl.$name,
                                verifyFn = function (modelValue, ifFormVerify) {
                                    if (verifyOnSubmit && !ifFormVerify) return;
                                    if (angular.isFunction(rulePredicate) && gValidator.disabled !== true) {
                                        var isValid = rulePredicate.call(me, modelValue, modelControl, ifFormVerify);
                                        if (rule.async !== true && rule.isMultiField !== true) {
                                            me.setValidityAndSendMessage(isValid, modelControl);
                                        }
                                    }
                                    return modelValue;
                                };

                            verifyFn.$modelControl = modelControl;
                            verifyFn.formName = formName;
                            verifyFn.ruleName = ruleName;
                            verifyFn.listenProperties = rule.listenProperties;

                            var filterFns = _(currentGroupVerifyFns).filter(function (fn) {
                                return fn.$modelControl === verifyFn.$modelControl && fn.formName === verifyFn.formName && fn.ruleName === verifyFn.ruleName;
                            });
                            if (filterFns.length <= 0) {
                                currentGroupVerifyFns.push(verifyFn);
                            }

                            if (!angular.isFunction(modelControl.verify)) {
                                var validFn = function (modelValue) {
                                    $timeout(function () {
                                        _.each(gValidator.getCurrentGroupVerifyFns(), function (fn) {
                                            if (fn.$modelControl === modelControl) {
                                                fn(modelValue);
                                            }
                                            if (fn.ruleName == "compare" && fn.$modelControl !== modelControl && _.contains(fn.listenProperties, modelControl.$name)) {
                                                fn(fn.$modelControl.$modelValue);
                                            }
                                        });
                                    });
                                    return modelValue;
                                };
                                modelControl.verify = function (isFormVerify) {
                                    if (modelControl.$pristine) {
                                        modelControl.$dirty = true;
                                        modelControl.$pristine = false;
                                    }
                                    var rulePromises = [];
                                    var fns = _(gValidator.getCurrentGroupVerifyFns()).filter(function (fn) {
                                        "use strict";
                                        return fn.$modelControl === modelControl;
                                    });
                                    _(fns).each(function (fn) {
                                        "use strict";
                                        var rulePromise = $q.defer();
                                        rulePromises.push(rulePromise.promise);
                                        CONTROL_RULE_DEFERREDS.add(fn.formName, fn.$modelControl.$name, fn.ruleName, rulePromise);
                                    });
                                    _(fns).each(function (fn) {
                                        "use strict";
                                        if (typeof isFormVerify === 'boolean') {
                                            fn(modelControl.$viewValue, isFormVerify);
                                        } else {
                                            fn(modelControl.$viewValue);
                                        }
                                    });
                                    return $q.all(rulePromises);
                                };
                                var $input = me.$verifyTargetCache[$name];
                                if (!$input.is('input') && !$input.is('textarea')) {
                                    $input = $input.find('input');
                                }
                                $input.on('blur', function () {
                                    var $this = $(this);
                                    $timeout(function () {
                                        if ($this.hasClass('is-bluring')) {
                                            return;
                                        }
                                        if ($this.is(':focus')) {
                                            modelControl.verify(false);
                                        } else {
                                            modelControl.verify(true);
                                        }
                                    }, 100);
                                }).on('blurVerify', function () {
                                    $timeout(function () {
                                        modelControl.verify(true);
                                    });
                                });
                                modelControl.$parsers.unshift(validFn);
                                modelControl.$formatters.unshift(validFn);
                            }
                        }
                    });
                }
                return me;
            };

            prototypeRef.setValidityAndSendMessage = function (isValid, modelControl) {
                var me = this,
                    ruleName = me.ruleName,
                    rule = me.rule,
                    formName = me.form.$name,
                    deferreds = CONTROL_RULE_DEFERREDS.getDeferreds(formName, modelControl.$name, ruleName),
                    reason, listenProperties, sameCombineListenControls;
                if (rule.property) {
                    modelControl.$setValidity(ruleName, isValid);
                    me.sendMessage(isValid, modelControl);
                } else {
                    listenProperties = me.getListenProperties();
                    sameCombineListenControls = me.getSameCombineControls(modelControl, listenProperties);
                    angular.forEach(sameCombineListenControls, function (control) {
                        control.$setValidity(ruleName, isValid);
                        me.sendMessage(isValid, control);
                    });
                }
                if (!_.isEmpty(deferreds)) {
                    reason = {isValid: isValid, modelControl: modelControl};
                    _.each(deferreds, function (deferred) {
                        if (isValid) {
                            deferred.resolve(reason);
                        } else {
                            deferred.reject(reason);
                        }
                    });
                    CONTROL_RULE_DEFERREDS.removeDeferreds(formName, modelControl.$name, ruleName);
                }
            };

            /**
             * @deprecated
             */
            prototypeRef.sendIllegalMessages = function (isValid, modelControl) {
                var me = this,
                    rule = me.rule,
                    listenProperties, sameCombineListenControls;
                if (rule.property) {
                    me.sendMessage(isValid, modelControl);
                } else {
                    listenProperties = me.getListenProperties();
                    sameCombineListenControls = me.getSameCombineControls(modelControl, listenProperties);
                    angular.forEach(sameCombineListenControls, function (control) {
                        me.sendMessage(isValid, control);
                    });
                }
            };

            prototypeRef.sendMessage = function (isValid, modelController) {
                var me = this,
                    formName = me.form ? me.form.$name : '',
                    rule = me.rule,
                    ruleName = rule.ruleName,
                    messageKey = rule.message,
                    gValidator = me.gValidator,
                    $outerContainer = me.$outerContainerCache[modelController.$name],
                    $verifyTarget = me.$verifyTargetCache[modelController.$name];
                if (!$outerContainer) return;

                function sendIllegalMessage(message) {
                    IllegalMessages.send({
                        isValid: isValid,
                        $outerContainer: $outerContainer,
                        $verifyTarget: $verifyTarget,
                        message: message || '',
                        ruleName: ruleName,
                        formName: formName,
                        messengerName: $outerContainer.data('invalid-msg') || gValidator.defaultIllegalTarget
                    });
                }

                if (gValidator.dynamic === true) {
                    sendIllegalMessage(gValidator.i18ns[messageKey]);
                } else {
                    ValidationHolder.loadI18ns(gValidator.$currentGroupName, function (i18ns) {
                        sendIllegalMessage(i18ns[messageKey]);
                    });
                }
            };

            prototypeRef.clearMessages = function () {
                var defaultMessengerName = this.gValidator.defaultIllegalTarget;

                angular.forEach(this.$outerContainerCache, function ($target) {
                    var messengerName = $target.data('invalid-msg') || defaultMessengerName;
                    IllegalMessages.clear(messengerName, $target);
                });
            };

            /**
             * 设置当前规则正在监听的控件的 angular 效验状态
             * @deprecated
             */
            prototypeRef.setListenControlsValidity = function (isValid, modelControl) {
                var me = this,
                    ruleName = me.ruleName,
                    rule = me.rule,
                    listenProperties, sameCombineListenControls;
                if (rule.property) {
                    modelControl.$setValidity(ruleName, isValid);
                } else {
                    listenProperties = me.getListenProperties();
                    sameCombineListenControls = me.getSameCombineControls(modelControl, listenProperties);
                    angular.forEach(sameCombineListenControls, function (control) {
                        control.$setValidity(ruleName, isValid);
                    });
                }
            };

            prototypeRef.notNull = function (rawValue) {
                return angular.isDefined(rawValue) && rawValue !== null;
            };

            prototypeRef.notEmpty = function (rawValue) {
                if (this.notNull(rawValue)) {
                    if (angular.isString(rawValue) || angular.isArray(rawValue)) {
                        return rawValue.length > 0;
                    } else {
                        throw new TypeError('NotEmpty 只支持 String 或 Array 类型的值的验证');
                    }
                }
                return false;
            };

            prototypeRef.notBlank = function (rawValue) {
                return !rawValue || (angular.isString(rawValue) && $.trim(rawValue).length > 0);
            };

            prototypeRef.require = function (rawValue) {
                if (this.gValidator.isInGrid === true && (requireDisabledInGrid && this.gValidator.requireDisabledInGrid)) {
                    return true;
                }
                return _.require(rawValue);
            };

            prototypeRef.numberRange = function (rawValue) {
                return this.range(rawValue);
            };
            prototypeRef.pattern = function (rawValue) {
                var rule = this.rule;

                return !rawValue || (getReg(rule.pattern, rule.flags).test(rawValue));

                function getReg(pattern, flags) {
                    if (flags) {
                        return new RegExp(pattern, flags);
                    } else {
                        return new RegExp(pattern);
                    }
                }
            };

            prototypeRef.min = function (rawValue) {
                var value = Number(rawValue);
                return this.isEmptyString(rawValue) || (angular.isNumber(value) && value >= this.rule.min);
            };

            prototypeRef.max = function (rawValue) {
                var value = Number(rawValue);
                return this.isEmptyString(rawValue) || (angular.isNumber(value) && value <= this.rule.max);
            };

            prototypeRef.length = function (rawValue) {
                if (angular.isNumber(rawValue)) rawValue = rawValue.toString();
                return angular.isUndefined(rawValue) || rawValue == null || (angular.isString(rawValue) && rawValue.length <= this.rule.max && rawValue.length >= this.rule.min);
            };

            function getRichLength(value, chineseWidth) {
                var len = 0,
                    _chineseWidth = config.controls.validation.chineseWidth;
                if (angular.isUndefined(chineseWidth) || !angular.isNumber(chineseWidth)) {
                    if (_chineseWidth) {
                        chineseWidth = _chineseWidth;
                    } else {
                        chineseWidth = 3;
                    }
                }
                for (var i = 0; i < value.length; i++) {
                    if (value.charCodeAt(i) > 255) //如果是汉字
                        len += chineseWidth;
                    else
                        len++;
                }
                return len;
            }

            prototypeRef.richLength = function (rawValue) {
                var value;
                if (!angular.isString(rawValue)) {
                    return true;
                }
                value = getRichLength(rawValue, this.rule.chineseWidth);
                return this.isEmptyString(rawValue) || (angular.isNumber(value) && value >= this.rule.min && value <= this.rule.max);
            };

            prototypeRef.numeric = function (rawValue) {
                var value, token;
                if (rawValue) {
                    value = Number(rawValue);
                    token = rawValue.split('.');

                    if (this.rule.precision >= 0 && (token[1] || '').length > this.rule.precision) {
                        return false;
                    } else if (this.rule.sign === 'POSITIVE' && value < 0) {
                        return false;
                    } else if (this.rule.sign === 'NEGATIVE' && value > 0) {
                        return false;
                    }
                }
                return true;
            };

            prototypeRef.range = function (rawValue) {
                var value = Number(rawValue);
                return this.isEmptyString(rawValue) || (angular.isNumber(value) && value >= this.rule.min && value <= this.rule.max);
            };

            prototypeRef.email = function (rawValue) {
                if (!rawValue) {
                    return true;
                }

                var emailParts = rawValue.toString().split("@");
                if (emailParts.length != 2) {
                    return false;
                }

                if (/\.$/.test(emailParts[0]) || /\.$/.test(emailParts[1])) {
                    return false;
                }

                if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*/i.test(emailParts[0])) {
                    return false;
                }

                return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)+|\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]/i.test(emailParts[1]);
            };

            /**
             *
             * @param rawValue {Date}
             */
            prototypeRef.dateMax = function (rawValue) {
                if (rawValue == null || !angular.isDate(rawValue)) return true;
                var me = this,
                    rule = me.rule,
                    compareTime = rule.compareTime || new Date().getTime(),
                    shiftedTime = rule.shiftedTime;
                return (compareTime + shiftedTime) >= rawValue.getTime();
            };

            /**
             *
             * @param rawValue {Date}
             */
            prototypeRef.dateMin = function (rawValue) {
                if (rawValue == null || !angular.isDate(rawValue)) return true;
                var me = this,
                    rule = me.rule,
                    compareTime = rule.compareTime || new Date().getTime(),
                    shiftedTime = rule.shiftedTime;
                return (compareTime + shiftedTime) <= rawValue.getTime();
            };

            prototypeRef.allMatch = function (rawValue, modelControl) {
                var me = this,
                    valMap = {},
                    allMatchControls = me.getSameCombineControls(modelControl, me.rule.listenProperties).concat(modelControl),
                    i = 0, modelValue, key;
                angular.forEach(allMatchControls, function (control) {
                    key = control.$viewValue;
                    if (key == null || angular.isUndefined(key)) key = '';
                    valMap[key] = undefined;
                });
                for (modelValue in valMap) {
                    if (valMap.hasOwnProperty(modelValue)) {
                        i++;
                    }
                }
                return i <= 1;
            };

            prototypeRef.compare = function (rawValue, modelControl) {
                var me = this,
                    rule = me.rule,
                    than = rule.than,
                    // compare 需要值的具体类型， 不适合使用 $viewValue
                    propertyCtrl = me.getSameCombineControl(modelControl, rule.property),
                    compareToCtrl = me.getSameCombineControl(modelControl, rule.compareTo),
                    propertyValue = propertyCtrl.$viewValue,
                    compareToVal = angular.isUndefined(compareToCtrl) ? null : compareToCtrl.$viewValue;
                if (angular.isDate(propertyValue)) {
                    propertyValue = propertyCtrl.$modelValue;
                }
                if (angular.isDate(compareToVal)) {
                    compareToVal = compareToCtrl.$modelValue;
                }
                if (angular.isUndefined(propertyValue) || angular.isUndefined(compareToVal)
                    || propertyValue === '' || compareToVal === ''
                    || propertyValue === null || compareToVal === null) {
                    return true;
                }
                //将2017-12-12T08:50:35.000Z字符转成日期进行比对(特殊处理)
                if (isNaN(propertyValue) && !isNaN(Date.parse(propertyValue))) {
                    propertyValue = Date.parse(propertyValue);
                }
                if (isNaN(compareToVal) && !isNaN(Date.parse(compareToVal))) {
                    compareToVal = Date.parse(compareToVal);
                }

                if (!angular.isDate(propertyValue) && !angular.isDate(compareToVal)) {
                    propertyValue = _.isNaN(Number(propertyValue)) ? propertyValue : Number(propertyValue);
                    compareToVal = _.isNaN(Number(compareToVal)) ? compareToVal : Number(compareToVal);
                }
                switch (than) {
                    case 'GREATER':
                        return propertyValue > compareToVal;
                    case 'GREATER_EQ':
                        return propertyValue >= compareToVal;
                    case 'LESS':
                        return propertyValue < compareToVal;
                    case 'LESS_EQ':
                        return propertyValue <= compareToVal;
                    default:
                        return true;
                }
            };

            prototypeRef.switchableFixedLength = function (rawValue) {
                if (!_.require(rawValue)) {
                    return true;
                }
                var me = this,
                    groupName = me.gValidator.$currentGroupName,
                    messageKey = me.rule.message,
                    config = DynamicValidationConfigsHolder.get(groupName, messageKey),
                    disabled = config.disabled,
                    fixedLength = config['fixedLength'];
                if (disabled === true) {
                    return true;
                }

                return String(rawValue).length === fixedLength;
            };

            prototypeRef.switchableMax = function (rawValue) {
                if (!_.require(rawValue)) {
                    return true;
                }
                var me = this,
                    groupName = me.gValidator.$currentGroupName,
                    messageKey = me.rule.message,
                    config = DynamicValidationConfigsHolder.get(groupName, messageKey),
                    disabled = config.disabled,
                    max = config['max'];
                if (disabled === true) {
                    return true;
                }
                return rawValue < max;
            };

            prototypeRef.switchableMultiFileldMax = function (value, modelControl, isFormVerify) {
                var me = this;
                if (isFormVerify === true) {
                    getRuleDelayFn(me.rule)(me);
                } else {
                    me.setValidityAndSendMessage(true, modelControl);
                }
            };

            function getRuleDelayFn(rule) {
                var retFn = rule.debounce;
                if (!retFn) {
                    rule.debounce = retFn = _.debounce(function (validator) {
                        var me = validator,
                            modelControls = validator.listenControls,
                            groupName = me.gValidator.$currentGroupName,
                            messageKey = me.rule.message,
                            isValid = true,
                            config = DynamicValidationConfigsHolder.get(groupName, messageKey),
                            disabled = config.disabled,
                            max = config['max'],
                            sum = 0;
                        if (disabled === true) {
                            return true;
                        }
                        angular.forEach(modelControls, function (modelControl) {
                            var num = Number(modelControl.$viewValue);
                            if (!isNaN(num)) {
                                sum += num;
                            }
                        });
                        if (sum > max) {
                            ValidationHolder.loadI18ns(me.gValidator.$currentGroupName, function (i18ns) {
                                GillionMsg.alert('提示', i18ns[messageKey] || '');
                            });
                            isValid = false;
                        }

                        angular.forEach(modelControls, function (modelControl) {
                            var deferreds = CONTROL_RULE_DEFERREDS.getDeferreds(me.form.$name, modelControl.$name, me.ruleName),
                                reason;
                            if (!_.isEmpty(deferreds)) {
                                reason = {isValid: isValid, modelControl: modelControl};
                                _.each(deferreds, function (deferred) {
                                    if (isValid) {
                                        deferred.resolve(reason);
                                    } else {
                                        deferred.reject(reason);
                                    }
                                });
                                CONTROL_RULE_DEFERREDS.removeDeferreds(me.form.$name, modelControl.$name, me.ruleName);
                            }
                        });
                    }, 500);
                }
                return retFn;
            }

            /**
             * @private
             * @param ngModel
             * @returns {Array<String, ?>} [字段名, 字段值]
             */
            function extractPropertyPair(ngModel) {
                if (!_.isEmpty(ngModel.$viewValue)) {
                    return [ngModel.$name, ngModel.$viewValue]
                } else {
                    var modelValue = (ngModel.$modelValue !== null) ? ngModel.$modelValue : '';
                    return [ngModel.$name, modelValue];
                }
            }

            /**
             * @private
             * @param basisNgModel 基准ngModel， 用于找到绑定的同级对象， 比如`basisNgModel` 绑定的name是 `someObj.prop1` 那么 properties只会匹配 ngModel的name以`someObj.`开头的
             * @param properties 需要榨取的属性集
             * @returns {Array<Array<String, ?>>}
             */
            prototypeRef.extractPropertiesPairs = function (basisNgModel, properties) {
                var me = this,
                    ngModels = me.getSameCombineControls(basisNgModel, properties);
                return _.map(ngModels, extractPropertyPair);
            };

            prototypeRef.getUniqueParams = function (basisNgModel) {
                var me = this,
                    rule = me.rule,
                    entity = rule.entity,
                    pkProperty = rule.pkProperty,
                    config = rule.configItemCode,
                    otherProperties = rule.properties;
                var pkNgModel = me.getSameCombineControl(basisNgModel, pkProperty);
                if (!pkNgModel) return {};
                var pkValue = extractPropertyPair(pkNgModel)[1];
                var otherPropertiesPairs = me.extractPropertiesPairs(basisNgModel, otherProperties);
                var fieldsValuesPair = _.unzip(otherPropertiesPairs);
                var configItemCode = "";
                if (rule.configItemCode) {
                    configItemCode = extractPropertyPair(me.getSameCombineControl(basisNgModel, config))[1];
                }
                return {
                    entityName: entity,
                    pkValue: pkValue,
                    fieldNames: fieldsValuesPair[0],
                    //TODO linjx 20170607 add
                    version: rule.version ? rule.version : false,
                    boName: rule.boName ? rule.boName : "",
                    fieldValues: fieldsValuesPair[1],
                    configItemCode: configItemCode
                };
            };

            prototypeRef.uniqueInSameSource = function (modelControl, uniqueParams) {
                var me = this,
                    $control = me.$verifyTargetCache[modelControl.$name],
                    fieldNames = uniqueParams.fieldNames,
                    fieldValues = uniqueParams.fieldValues,
                    source;
                var fieldNamesInSourceRecord = _.map(fieldNames, function (x) {
                    if (x) {
                        var dotIdx = x.indexOf('.');
                        if (dotIdx !== -1) {
                            return x.substring(dotIdx + 1);
                        }
                        return x;
                    }
                });

                if ($control) {
                    source = $control.data('$dataSource');
                    if (source) {
                        var repeatCount = _.filter(source, function (record) {
                            var values = _.map(fieldNamesInSourceRecord, _.propertyOf(record));
                            if (_.any(values, _.require)) {
                                /*if (values.join() == joinValues) {
                                    return true;
                                }*/
                                //单元格编辑时数字会带上格式, 所以针对数字一个个进行比较
                                if (fieldValues.length === values.length) {
                                    var sameCount = 0;
                                    for (var i = 0; i < fieldValues.length; i++) {
                                        if ((angular.isNumber(fieldValues[i]) || angular.isNumber(values[i])) && Number(fieldValues[i]) === Number(values[i])) {
                                            sameCount++;
                                        } else {
                                            if (fieldValues[i] === values[i]) sameCount++;
                                        }
                                    }
                                    if (fieldValues.length === sameCount) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }).length;
                        return repeatCount <= 1;
                    }
                }
                return true;
            };

            function getAsyncUniqueReq(rule, me) {
                var retFn = rule.asyncUniqueReq,
                    validatorConfigValue = me.gValidator.validatorConfigValue,
                    ctx = validatorConfigValue ? config.$paths[validatorConfigValue].ctx : config.$paths.$current.ctx;
                if (!retFn) {
                    rule.asyncUniqueReq = retFn = _.debounce(function (validator, uniqueParamsJson, ngModels, uniqueInSameSource) {
                        $.ajax({
                            type: "POST",
                            url: ctx + '/validation/unique',
                            failHandler: false,
                            async: true,
                            contentType: 'application/json',
                            data: uniqueParamsJson
                        }).done(function (result) {
                            var uniqueParams = JSON.parse(uniqueParamsJson);

                            var isValid = result && result.success === true && uniqueInSameSource;

                            var pkNgModel = me.getSameCombineControl(ngModels[0], rule.pkProperty);
                            if (pkNgModel) {
                                var pkValue = extractPropertyPair(pkNgModel)[1];
                                if (pkValue !== uniqueParams.pkValue) {
                                    return;
                                }
                            }

                            angular.forEach(ngModels, function (v) {
                                validator.setValidityAndSendMessage(isValid, v);
                            });
                        });
                    }, 500);
                }
                return retFn;
            }

            function getSyncUniqueReq(rule, me) {
                var retFn = rule.syncUniqueReq,
                    validatorConfigValue = me.gValidator.validatorConfigValue,
                    ctx = validatorConfigValue ? config.$paths[validatorConfigValue].ctx : config.$paths.$current.ctx;

                if (!retFn) {
                    rule.syncUniqueReq = retFn = function (validator, uniqueParamsJson) {
                        var isValid = false;
                        $.ajax({
                            type: "POST",
                            url: ctx + '/validation/unique',
                            failHandler: false,
                            async: false,
                            contentType: 'application/json',
                            data: uniqueParamsJson
                        }).done(function (result) {
                            isValid = result && result.success === true;
                        });
                        return isValid;
                    };
                    //_.debounce(, 500, true); 去掉debounce，多个同样请求同时请求只会返回一个值
                }
                return retFn;
            }

            prototypeRef.unique = function (value, modelControl, isFormVerify) {
                if (!modelControl) return true;
                var me = this,
                    uniqueParams = me.getUniqueParams(modelControl),
                    uniqueParamsJson = angular.toJson(uniqueParams),
                    anyInput = _.any(uniqueParams.fieldValues, _.require),
                    hasUndefined = _.contains(uniqueParams.fieldValues, undefined);
                if (_.isEmpty(uniqueParams)) return;
                if (anyInput && !hasUndefined) {
                    var uniqueInSameSource = me.uniqueInSameSource(modelControl, uniqueParams);
                    var ngModels = me.getSameCombineControls(modelControl, me.rule.properties);
                    if (isFormVerify) {
                        var isValid = getSyncUniqueReq(me.rule, me)(me, uniqueParamsJson);
                        angular.forEach(ngModels, function (v) {
                            me.setValidityAndSendMessage(isValid && uniqueInSameSource, v);
                        });
                    } else {
                        getAsyncUniqueReq(me.rule, me)(me, uniqueParamsJson, ngModels, uniqueInSameSource);
                    }
                } else {
                    me.setValidityAndSendMessage(true, modelControl);
                }
            };

            prototypeRef.eitherNotBlank = function (value, modelControl) {
                var me = this,
                    properties = me.properties,
                    controls = me.getSameCombineControls(modelControl, properties);
                return Arrays.exists(controls, Predicates.newPropPredicate('$viewValue', function (val) {
                    return me.notNull(val) && $.trim(val).length > 0;
                }));
            };

            prototypeRef.dateSpan = function (rawValue, modelControl) {
                var me = this,
                    rule = me.rule,
                    limit = rule.limit,
                    minDateField = me.getSameCombineControl(modelControl, rule.minDateField),
                    maxDateField = me.getSameCombineControl(modelControl, rule.maxDateField),
                    minDate, maxDate, span;
                if (minDateField && maxDateField) {
                    minDate = minDateField.$viewValue;
                    maxDate = maxDateField.$viewValue;
                    if (minDate && maxDate) {
                        span = maxDate.getTime() - minDate.getTime();
                        return span >= 0 && span < limit;
                    }
                }
                return true;
            };

            prototypeRef.isEmptyString = function (value) {
                return !this.notNull(value) || (angular.isString(value) && value.length == 0);
            };

            prototypeRef.getSameCombineControls = function (modelControl, properties) {
                var me = this,
                    sameCombineControls = [];
                angular.forEach(properties, function (prop) {
                    if (prop) {
                        var sameCombineControl = me.getSameCombineControl(modelControl, prop);
                        if (sameCombineControl) {
                            sameCombineControls.push(sameCombineControl)
                        }
                    }
                });
                return sameCombineControls;
            };

            prototypeRef.getSameCombineControl = function (modelControl, property) {
                var me = this,
                    rule = me.rule,
                    form = me.form,
                    controlName = modelControl.$name;
                if (rule.combineName) {
                    var matched = controlName.match(/\[\d]/);
                    if (Arrays.isNotEmptyArray(matched)) {
                        return form[rule.combineName + matched[0] + '.' + property];
                    }
                } else {
                    return form[property];
                }
            };

            return {
                /**
                 *
                 * @param gValidator {FormValidatorController}
                 * @return 控件效验器
                 */
                from: function (gValidator) {
                    return new ControlValidator(gValidator);
                },

                isSupported: function (ruleName) {
                    return angular.isFunction(ControlValidator.prototype[ruleName]);
                }
            }
        };
    }
);
