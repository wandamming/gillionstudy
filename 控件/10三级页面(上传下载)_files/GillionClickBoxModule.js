/**
 * Created by huangzx on 2015/7/20.
 */
define('framework/clickbox/GillionClickBoxModule', [
    'angular',
    "framework/tabindex/TabindexModule"
], function (angular) {
    var tempId = 1;

    //单选按钮
    function Radio(ele, scope) {
        this.ele = ele;
        this.scope = scope;
    }

    //单选按钮组
    function RadioGroup() {
        this.radios = [];
    }

    //添加单选按钮
    RadioGroup.prototype.addRadio = function (radio) {
        this.radios.push(radio);
    };
    //按钮组赋值
    RadioGroup.prototype.setValue = function (value) {
        angular.forEach(this.radios, function (radio) {
            if (value != radio.scope.value)
                radio.scope.selected = false;
        })
    };
    //禁用
    RadioGroup.prototype.disable = function () {
        angular.forEach(this.radios, function (radio) {
            radio.ele.attr("disabled", 'disabled');
        })
    };
    //启用
    RadioGroup.prototype.enable = function () {
        angular.forEach(this.radios, function (radio) {
            radio.ele.removeAttr('disabled');
        })
    };

    return angular.module('GillionClickBoxModule', ["TabindexModule"]).directive('gCheckboxGroup', function ($parse, Arrays,$timeout) {
        return {
            restrict: 'A',
            require: ['gCheckboxGroup', 'ngModel'],
            link: {
                pre: function (scope, element, attrs, controllers) {
                    var groupController = controllers[0],
                        ngModelController = controllers[1],
                        disabledParse = $parse(attrs.ngDisabled);
                    groupController.setNgModelController(ngModelController);

                    scope.$on('$destroy', function () {
                        element.remove();
                        for (var key in groupController) {
                            delete groupController[key];
                        }
                    });

                    scope.$watch(function () {
                        if (disabledParse(scope)) {
                            groupController.disable();
                        } else {
                            groupController.enable();
                        }
                    });
                }
            },
            controller: function ($scope,$attrs) {
                var _this = this;
                this.setItemChecked = function (itemValue, checked) {
                    var ngModelController = this.ngModelController,
                        viewValue = ngModelController.$viewValue;
                    if (angular.isUndefined(viewValue) || !_.isArray(viewValue)) {
                        viewValue = [];
                        ngModelController.$setViewValue(viewValue);
                    }
                    if (checked && !Arrays.exists(viewValue, itemValue)) {
                        viewValue.push(itemValue);
                    } else if (checked === false) {
                        Arrays.remove(viewValue, itemValue);
                    }
                };
                this.checkBoxItemsChange = [];
                $scope.$watch($attrs.ngModel,function(newVal,oldVal){
                    $timeout(function(){
                        if($attrs.gGroupValueSeparator){
                            newVal = newVal.split($attrs.gGroupValueSeparator);
                        }
                        _.forEach(_this.checkBoxItemsChange,function(checkBoxItemChange){
                            if(angular.isFunction(checkBoxItemChange)){
                               
                                checkBoxItemChange(newVal);
                            }
                        });
                    })
                    
                },true);


                this.setNgModelController = function (ngModelController) {
                    this.ngModelController = ngModelController;
                };

                this.checkBoxs = [];
                this.addCheckBox = function (checkBox) {
                    this.checkBoxs.push(checkBox);
                };

                this.disable = function () {
                    angular.forEach(this.checkBoxs, function (checkBox) {
                        checkBox.attr("disabled", 'disabled');
                    });
                };

                this.enable = function () {
                    angular.forEach(this.checkBoxs, function (checkBox) {
                        checkBox.removeAttr('disabled');
                    });
                };
            }
        }
    }).directive('gCheckbox', function (Arrays, $tabindex) {
        return {
            restrict: 'E',
            scope: {
                display: '@',
                value: '@',
                onBeforeCheck: '&',
                onCheck: '&',
                inverseCheck: '@'
            },
            require: ['^?gCheckboxGroup', '?ngModel'],
            replace: true,
            template: '<div class="form-clickbox" ng-click="toggleChecked()" ng-class="{\'selected\':inverseCheck === undefined ? selected : !selected}" ng-selected="inverseCheck === undefined ? selected : !selected"><a href="javascript:void(0);" class="fi" ></a><label ng-if="display" for="{{ckId}}">{{display}}</label></div>',
            controller: function ($scope, $element) {

                var inputElement;
                inputElement = $element.find(".fi");
                /*为控件注册tabIndex服务 */
                $tabindex.register(inputElement, $element);
            },
            link: function (scope, ele, attrs, controllers) {
                var groupController = controllers[0],
                    ngModelController = controllers[1],
                    onBeforeCheck = scope.onBeforeCheck || angular.noop,
                    onCheck = scope.onCheck || angular.noop,
                    ckId;
                if (typeof scope.display != 'undefined') {
                    scope.ckId = ckId = 'ck_' + tempId++;
                    ele.find('a').attr('id', ckId);
                }

                function exists(source, element) {
                    var source = angular.isArray(source) ? source : [],
                        i = 0,
                        len = source.length;
                    if (angular.isArray(source)) {
                        for (; i < len; i++) {
                            if (element == source[i].toString()) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                if (groupController) {
                    groupController.addCheckBox(ele);
                    if (angular.isDefined(groupController.ngModelController.$viewValue)) {
                        scope.selected = exists(groupController.ngModelController.$viewValue, scope.value);
                    }
                    //groupController.ngModelController.$formatters.push(itemChangeFunc);
                    groupController.checkBoxItemsChange.push(function (rawValue) {
                        scope.selected = exists(rawValue, scope.value);
                        return rawValue;
                    });
                } else {
                    if (angular.isDefined(ngModelController.$viewValue) && ngModelController.$viewValue != null) {
                        scope.selected = (ngModelController.$viewValue.toString() == scope.value);
                    }
                    ngModelController.$formatters.push(function (rawValue) {
                        if (!scope.value) {
                            if (angular.isDefined(rawValue) && rawValue != null && rawValue !== false) scope.selected = true;
                            else scope.selected = false;
                        } else {
                            scope.selected = (angular.isDefined(rawValue) && rawValue != null && rawValue.toString() == scope.value);
                        }
                        return rawValue;
                    });
                }

                scope.toggleChecked = function () {
                    if (ele.attr('disabled') === 'disabled') return;
                    if (onBeforeCheck() === false) return;
                    scope.selected = !scope.selected;
                    if (groupController) {
                        groupController.setItemChecked(scope.value, scope.selected);
                    } else if (ngModelController) {
                        if (scope.selected) ngModelController.$setViewValue(scope.value || true);
                        else ngModelController.$setViewValue(false);
                    }
                    onCheck({checked: scope.selected});
                };

                ele.on('keydown', 'a', function (event) {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                    }
                });
            }
        };
    }).directive('gRadioGroup', function ($parse) {
        return {
            restrict: 'A',
            require: ['gRadioGroup', 'ngModel'],
            link: {
                pre: function (scope, element, attrs, controllers) {
                    var groupController = controllers[0],
                        ngModelController = controllers[1],
                        disabledParse = $parse(attrs.ngDisabled);
                    groupController.setNgModelController(ngModelController);

                    scope.$on('$destroy', function () {
                        element.remove();
                        for (var key in groupController) {
                            delete groupController[key];
                        }
                    });

                    scope.$watch(function () {
                        if (disabledParse(scope)) {
                            groupController.radioGroup.disable();
                        } else {
                            groupController.radioGroup.enable();
                        }
                    });
                }
            },
            controller: function ($scope, $element, $attrs) {
                this.radioGroup = new RadioGroup();

                this.setItemChecked = function (itemValue) {
                    var ngModelController = this.ngModelController;
                    ngModelController.$setViewValue(itemValue);
                    this.radioGroup.setValue(itemValue);
                };

                this.setNgModelController = function (ngModelController) {
                    this.ngModelController = ngModelController;
                };
            }

        }
    }).directive('gRadio', function ($tabindex) {
        return {
            restrict: 'E',
            scope: {
                text: '@display',
                value: '@',
                onBeforeCheck: '&',
                onCheck: '&',
                ngDisabled: '='
            },
            require: ['^?gRadioGroup', '?ngModel'],
            replace: true,
            template: '<div class="form-clickbox" mode="radio" ng-class="{\'selected\':selected, \'g-radio-disabled\':ngDisabled}"\n     ng-click="toggleChecked()" ng-selected="selected"><a href="javascript:void(0);" class="fi"></a>\n    <label outer-scope="$parent" for="{{ckId}}"\n           render-item-class  render-item-class-locals="text,value">{{text}}</label>\n</div>',
            controller: function ($scope, $element) {

                var inputElement;
                inputElement = $element.find(".fi");
                /*为控件注册tabIndex服务 */
                $tabindex.register(inputElement, $element);
            },
            link: function (scope, ele, attrs, controllers) {
                var groupController = controllers[0],
                    ngModelController = controllers[1],
                    onBeforeCheck = scope.onBeforeCheck,
                    onCheck = scope.onCheck,
                    ckId;

                if (typeof scope.text != 'undefined') {
                    scope.ckId = ckId = 'ck_' + tempId++;
                    ele.find('a').attr('id', ckId);
                }

                if (groupController) {
                    ngModelController = groupController.ngModelController;
                }

                if (angular.isDefined(ngModelController.$viewValue) && ngModelController.$viewValue != null) {
                    scope.selected = (ngModelController.$viewValue.toString() === scope.value);
                }

                ngModelController.$formatters.push(function (rawValue) {
                    scope.selected = (angular.isDefined(rawValue) && rawValue != null && rawValue.toString() === scope.value);
                    return rawValue;
                });

                scope.toggleChecked = function () {
                    if (ele.attr('disabled') === 'disabled') return;
                    if (scope.ngDisabled) return;
                    if (onBeforeCheck({value: scope.value, text: scope.text}) === false) return;
                    scope.selected = true;
                    if (groupController) {
                        groupController.setItemChecked(scope.value);
                    } else if (ngModelController) {
                        ngModelController.$setViewValue(scope.value);
                    }
                    onCheck({value: scope.value, text: scope.text});
                };

                ele.on('keydown', 'a', function (event) {
                    if (event.keyCode === 13) {
                        event.preventDefault();
                    }
                });

                if (groupController) {
                    var radio = new Radio(ele, scope);
                    groupController.radioGroup.addRadio(radio);
                }
            }
        };
    });
});