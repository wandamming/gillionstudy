define('framework/unit/GillionUnitDirectiveConstructor', ['angular'], function (angular) {
    return function ($compile, $tabindex) {
        return {
            restrict: 'A',
            scope: {
                show: '=ngShow',
                readonly: '=ngReadonly',
                disabled: '=ngDisabled'
            },
            link: function ($scope, $element, $attrs) {
                var beforeName = $attrs.unitBefore,
                    afterName = $attrs.unitAfter,
                    unitName = $attrs.gUnit,
                    width = $attrs.width,
                    disabled = $attrs.disabled,
                    readonly = $attrs.readonly,
                    warp;

                if ((readonly === "readonly" || readonly === true || $scope.readonly === true) && (disabled === "disabled" || disabled === true || $scope.disabled === true)) {
                    warp = '<div disabled="disabled" readolny="readonly" class="form-unit" msg-target></div>';
                } else if (disabled === "disabled" || disabled === true || $scope.disabled === true) {
                    warp = '<div disabled="disabled" class="form-unit" msg-target></div>';
                } else if (readonly === "readonly" || readonly === true || $scope.readonly === true) {
                    warp = '<div readonly="readonly" class="form-unit" msg-target></div>';
                } else {
                    warp = '<div class="form-unit" msg-target></div>';
                }

                $scope.$watch("disabled", function (value) {
                    if (disabled !== "disabled" && disabled !== true) {
                        if (value === true || value === "disabled") {
                            $element.parent().attr("disabled", "disabled");
                        } else {
                            $element.parent().removeAttr("disabled");
                        }
                    }
                });

                $scope.$watch("readonly", function (value) {
                    if (disabled !== "disabled" && disabled !== true) {
                        if (value === true || value === "readonly") {
                            $element.parent().attr("readonly", "readonly");
                        } else {
                            $element.parent().removeAttr("readonly");
                        }
                    }
                });

                $attrs.$set('msg-target', 'parent');
                $element.wrap($compile(warp)($scope));
                $tabindex.register($element, angular.element(warp));
                afterName = afterName || unitName;
                if (afterName) {
                    $element.after("<em>" + afterName + "</em>");
                }
                if (beforeName) {
                    $element.before("<em>" + beforeName + "</em>");
                }
                //设置控件宽度
                if (width) {
                    var unitRegExp = /^(([0-9]+)|([0-9]+\.[0-9]+))(%|in|cm|mm|pt|pc|ex|em|px)?$/g;
                    if (unitRegExp.test(width)) {
                        $element.parent().css("width", width);
                    } else {
                        throw "宽度设置错误";
                    }
                }
                //设置隐藏
                if (angular.isDefined($scope.show)) {
                    if ($scope.show === false) {
                        $element.parent().hide();
                    }
                }
                //单击文件框时内容全选
                $element.on('blur', function () {
                    this.selectFlag = false;
                });

                $element.on('click', function () {                    
                    if (this.selectFlag) {
                        $element.focus();
                    } else {
                        $element.select();
                        this.selectFlag = true;
                    }
                });

                $scope.$on("$destroy", function () {
                    $element.remove();
                });
            }
        }
    }
});