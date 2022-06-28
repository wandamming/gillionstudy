define('framework/control/GillionFocusSelectConstructor', [
    'angular'
], function (angular) {
    return function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var inputElements;
                if (element.is('input,textarea')) {
                    $timeout(function () {
                        if (angular.isDefined(element.attr("disabled")) && (angular.isDefined(element.attr("data-source-name")) || angular.isDefined(element.attr("g-areas")))) {
                            element.removeAttr("disabled");
                            element.attr("readonly", "readonly");
                        }
                        if (!element.hasClass("form-suggestbox")) {
                            element.on('focus', function () {
                                if (this.selectFlag) {
                                    this.focus();
                                } else {
                                    this.select();
                                    this.selectFlag = true;
                                }
                            });
                            element.on('blur', function () {
                                this.selectFlag = false;
                            });
                        }
                    });
                } else {
                    $timeout(function () {
                        inputElements = element.find("input[disabled]");
                        angular.forEach(inputElements, function (ele) {
                            angular.element(ele).removeAttr("disabled");
                            angular.element(ele).attr("readonly", "readonly");
                        });
                        element.on('focus', ':input', function () {
                            if (this.selectFlag) {
                                this.focus();
                            } else {
                                this.select();
                                this.selectFlag = true;
                            }
                        });
                        element.on('blur', ':input', function () {
                            this.selectFlag = false;
                        });
                    });
                }


                if (angular.isDefined(attr.ngDisabled)) {
                    scope.$watch(attr["ngDisabled"], function (value) {
                        $timeout(function () {
                            if (!value) {
                                if (element.is('input,textarea')) {
                                    element.removeAttr("readonly");
                                } else {
                                    inputElements = element.find("input[readonly]");
                                    angular.forEach(inputElements, function (ele) {
                                        angular.element(ele).removeAttr("readonly");
                                    });
                                }
                            } else {
                                if (element.is('input,textarea')) {
                                    element.removeAttr("disabled");
                                    element.attr("readonly", "readonly");
                                } else {
                                    inputElements = element.find("input[disabled]");
                                    angular.forEach(inputElements, function (ele) {
                                        angular.element(ele).removeAttr("disabled");
                                        angular.element(ele).attr("readonly", "readonly");
                                    });
                                }
                            }
                        });
                        return value;
                    });
                }
            }
        };
    };
});