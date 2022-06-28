/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/18
 * Time: 15:54
 */
define([
    'require',
    'angular',
    'underscore',
    'config.properties'
], function (require, angular, _, config) {
    return function ($http, $window, $compile, $q, I18NLoader, ControlValidatorService, Arrays, IllegalMessages, /**@type {ValidationHolder}*/ ValidationHolder) {

        var gValidatorProto = FormValidatorController.prototype,
            uniqueSync = config.controls.uniqueSync;

        /**
         * @cfg params.$form {jQuery()} 表单元素
         * @cfg params.entityName {String} 实体名称
         * @cfg params.defaultIllegalTarget {String} 默认错误消息输出位置
         * @constructor
         */
        function FormValidatorController(params) {
            angular.extend(this, params);
            this.controlValidators = [];
            this.$rulesAndI18ns = {};
        }

        gValidatorProto.setRules = function (rules) {
            this.rules = rules;
        };

        gValidatorProto.getFieldRules = function (originProp) {
            var lastDotIndex = originProp.indexOf('.'),
                inCombine = lastDotIndex !== -1,
                propertyName = originProp;
            if (inCombine) {
                propertyName = originProp.substr(lastDotIndex + 1);
            }
            return Arrays.filter(this.rules, function (rule) {
                if (Arrays.exists(rule.listenProperties, originProp)) {
                    return true;
                }
                if (originProp === rule.property) {
                    return true;
                }
                if (Arrays.exists(rule.properties, originProp)) {
                    return true;
                }
                if (inCombine && !(new RegExp('^' + rule.combineName + '(\\\[\\\d+\\\])?\.' + propertyName + '$')).test(originProp)) {
                    return false;
                }
                if (rule.listenProperties) {
                    return Arrays.exists(rule.listenProperties, propertyName);
                } else if (rule.property) {
                    return rule.property === propertyName;
                } else if (rule.properties) {
                    return Arrays.exists(rule.properties, propertyName);
                }
                return false;
            });
        };

        gValidatorProto.setEntityI18n = function (entityI18n) {
            this.entityI18n = entityI18n;
        };

        gValidatorProto.setForm = function (form) {
            this.form = form;
            form.$validator = this;
        };

        gValidatorProto.setForm$ = function ($form) {
            this.$form = $form;
        };

        //noinspection JSUnusedLocalSymbols
        /**
         *
         * @cfg params.gValidator {FormValidatorController} 表单校验器
         * @cfg params.field {ngModelController} 字段
         * @cfg params.rules {[Object]} 校验规则
         * @constructor
         */
        function FieldValidator(params) {

        }

        /**
         * @param [control] 表单校验初始化后添加到表单中（比如foreach的控件）的控件调用时需要传入control
         */
        gValidatorProto.forEachRulesValidator = function (control) {
            var me = this;
            ValidationHolder.loadRules(me.$currentGroupName, function (rules) {
                var willExecRules;
                if (control) {
                    willExecRules = me.getFieldRules(control.$name);
                } else {
                    willExecRules = me.rules = rules; // 每次load后重新为当前rules赋值， 考虑可能执行切换
                }
                _.each(willExecRules, function (rule) {
                    new RuleValidator({
                        rule: rule,
                        gValidator: me,
                        control: control
                    });
                });
            }, me.validatorConfigValue);
        };

        gValidatorProto.disable = function () {
            this.disabled = true;
        };

        gValidatorProto.enable = function () {
            this.disabled = false;
        };

        gValidatorProto.reset = function () {
            var me = this,
                controlValidators = me.controlValidators;
            angular.forEach(controlValidators, function (controlValidator) {

                controlValidator.clearMessages();
                angular.forEach(controlValidator.listenControls, function (modelController) {
                    if (modelController) {
                        modelController.$setValidity(controlValidator.rule.ruleName, true);
                        modelController.$setPristine();
                    }
                });

            })
        };

        gValidatorProto.destroy = function () {
            var me = this,
                controlValidators = me.controlValidators;
            angular.forEach(controlValidators, function (controlValidator) {
                controlValidator.clearMessages();
            });

            me.controlValidators = [];
            me.$rulesAndI18ns = {};
        };

        /**
         *
         * @param validationGroupName {String} 校验分组名
         */
        gValidatorProto.setActiveGroupName = function (validationGroupName) {
            this.$currentGroupName = validationGroupName;
        };

        gValidatorProto.getCurrentGroupVerifyFns = function () {
            var me = this,
                currentGroupName = me.$currentGroupName,
                groups, currentGroup;
            if (!me.hasOwnProperty('$groups')) {
                me.$groups = {};
            }
            groups = me.$groups;
            if (!groups.hasOwnProperty(currentGroupName)) {
                groups[currentGroupName] = {};
            }
            currentGroup = groups[currentGroupName];
            if (!_.isArray(currentGroup.$verifyFns)) {
                currentGroup.$verifyFns = [];
            }
            return currentGroup.$verifyFns;
        };

        gValidatorProto.switchTo = function (validationGroupName) {
            this.setActiveGroupName(validationGroupName);
            this.forEachRulesValidator();
        };

        gValidatorProto.clearCurrentGroupVerifyFns = function () {
            var me = this,
                currentGroupName = me.$currentGroupName;
            try {
                me.$groups[currentGroupName].$verifyFns = [];
            } catch (e) {
                return;
            }
        };

        /**
         * 动态校验，参数及提示信息由外部提供
         */
        gValidatorProto.initRule = function (rules, i18ns) {
            var me = this;
            me.i18ns = i18ns["root"] ? i18ns["root"] : i18ns;
            if (rules["rules"]) rules = rules["rules"];
            _.each(rules, function (rule) {
                new RuleValidator({
                    rule: rule,
                    gValidator: me,
                    control: false
                });
            });
        };

        /**
         *
         * @param params.rule {Array?} 当前字段的校验规则
         * @param params.gValidator {FormValidatorController}
         * @param params.control {ngModelController}
         * @constructor
         */
        function RuleValidator(params) {
            var me = this;
            me.rule = params.rule;
            me.gValidator = params.gValidator;
            me.applyValidator(params.control);
        }

        /**
         * @param [control] 表单校验初始化后添加到表单中（比如foreach的控件）的控件调用时需要传入control
         */
        RuleValidator.prototype.applyValidator = function (control) {
            var me = this,
                rule = me.rule,
                controlValidators = me.gValidator.controlValidators,
                listenProperties;
            if (ControlValidatorService.isSupported(rule.ruleName)) {
                var controlValidator = ControlValidatorService.from(me);
                if (control) {
                    // fillListenControls start
                    listenProperties = controlValidator.getListenProperties();
                    if (listenProperties.length === 1) {
                        controlValidator.listenControls = [control];
                    } else {
                        controlValidator.listenControls = controlValidator.getSameCombineControls(control, listenProperties);
                    }
                    // fillListenControls end
                    controlValidator
                        .fillListenControlsTargets$()
                        .apply();
                } else {
                    controlValidator
                        .fillListenControls()
                        .fillListenControlsTargets$()
                        .apply();
                }
                controlValidators.push(controlValidator);
            }
        };

        return {
            restrict: 'A',
            require: ['form', 'gValidator'],
            scope: false,
            link: function (scope, element, attrs, controllers) {
                var form = controllers[0],
                    gValidator = controllers[1],
                    entityAndGroupName = attrs['gValidator'],
                    outerValidatorName = attrs.validationApi;

                if (!!outerValidatorName) {
                    scope[outerValidatorName] = gValidator;
                }

                if (!entityAndGroupName) {
                    throw new ReferenceError("require entityAndGroupName");
                }

                gValidator.setForm(form);
                if (gValidator.dynamic !== true) gValidator.switchTo(entityAndGroupName);

                form.verify = function () {
                    var formName = form.$name;
                    IllegalMessages.startValidForm(formName);
                    var fieldVerifyPromises = _.chain(form)
                        .extendOwn({})
                        .omit(function (field, fieldName) {
                            return !(/^[^\$]/.test(fieldName) && field && angular.isFunction(field.verify));
                        })
                        .values()
                        .invoke('verify', uniqueSync)
                        .value();
                    if (!(scope.$$phase || scope.$root.$$phase)) {
                        scope.$digest();
                    }
                    return $q.all(fieldVerifyPromises);
                };
                if (!(scope.$$phase || scope.$root.$$phase)) {
                    scope.$digest();
                }

                scope.$on('$destroy', function () {
                    element.remove();
                    gValidator.destroy();
                });
            },
            controller: ['$scope', '$element', '$attrs', '$compile', function ($scope, $element, $attrs, $compile) {
                var entityAndGroupName = $attrs['gValidator'],
                    defaultIllegalTarget = $attrs['invalidMsg'],
                    validatorConfigValue = $attrs['validatorConfigKey'];

                var parameter = {
                    $form: $element,
                    defaultIllegalTarget: defaultIllegalTarget,
                    validatorConfigValue: validatorConfigValue
                };
                if (entityAndGroupName === "dynamic") {
                    parameter["dynamic"] = true;
                } else {
                    parameter["entityName"] = entityAndGroupName.split('_')[0];
                }
                return new FormValidatorController(parameter);
            }]
        }
    };
});