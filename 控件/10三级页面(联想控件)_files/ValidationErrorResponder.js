define('framework/validation/ValidationErrorResponder',
    ['angular', 'underscore', 'config.properties'], function (angular, _, config){
    return function ($document, ValidationHolder, IllegalMessages, GillionMsg){
        var fieldErrorsTransformer = _.getValue(config, 'controls.validation.fieldErrorsTransformer', _.identity);

        function getOuterContainer($control){
            if ($control.is('[outer-container]')) {
                return $control.parent().closest('[outer-container]');
            }
            return $control;
        }

        function getVerifyTarget($control){
            if ($control.is('[verify-target]')) {
                return $control.find('[verify-target]');
            }
            return $control;
        }

        return {
            res: function (group, fieldErrors) {
                var pairs = _.chain($document.context.forms)
                    .map(function (form) {
                        return [form, angular.element(form).data('$formController')];
                    })
                    .filter(function (pair){
                        var fromControl = pair[1];
                        return fromControl && fromControl.$validator && fromControl.$validator.$currentGroupName === group;
                    })
                    .value();
                
                _.chain(pairs)
                    .map(_.compose(_.property('1'), _.property('$name')))
                    .each(_.bind(IllegalMessages.startValidForm, IllegalMessages));


                fieldErrors = fieldErrorsTransformer(fieldErrors, group, pairs);

                _.each(fieldErrors, function (fieldError){
                    var fieldName = fieldError.field,
                        ruleName = fieldError.ruleName,
                        messageKey = fieldError.messageKey,
                        pair = _.find(pairs, function (pair) {
                            return _.has(pair[1], fieldName);
                        }),
                        formController, $validator, controlValidators, controlValidator, rule;


                    if (ruleName === 'switchableMultiFileldMax') {
                        pair = _.find(pairs, function (pair) {
                            var keys = _.keys(pair[1]);
                            for (var i=0; i<keys.length; i++) {
                                if (keys[i].indexOf(fieldName) > -1) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (pair) {
                            formController = pair[1];
                            ValidationHolder.loadI18ns(formController.$validator.$currentGroupName, function (i18ns) {
                                GillionMsg.alert('提示', i18ns[messageKey] || '');
                            });
                        }
                        return ;
                    }

                    if (pair) {
                        formController = pair[1];
                        $validator = formController.$validator;
                        controlValidators = $validator.controlValidators;
                        controlValidator = _.find(controlValidators, function (cv) {
                            var rule = cv.rule,
                                combineName = rule.combineName,
                                reg;
                            if (combineName && cv.ruleName === 'switchableMax') {
                                _.each(cv.listenControls, function (listenControl) {
                                    if (listenControl.$name == fieldName) {
                                        cv.sendMessage(false, listenControl);
                                    }
                                });
                                return false;
                            }
                            return cv.ruleName === ruleName && (cv.property === fieldName || _.contains(cv.properties, fieldName));
                        });

                        if (controlValidator) {
                            _.each(controlValidator.listenControls, function (listenControl) {
                                controlValidator.sendMessage(false, listenControl);
                            });
                        }
                    }
                });
            }
        }
    }
});