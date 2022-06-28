// Generated by CoffeeScript 1.9.3
(function () {
    define(["angular", "framework/time/CursorPositionUtil",
        "framework/time/TimePane",
        "framework/utils/DBCUtils",
        "config.properties",
        "framework/tabindex/TabindexModule"], function (angular, CursorPositionUtil, TimePane, DBCUtils, globalConfig) {
        var TimeHandler, TimeModule, ngModelListener;
        TimeModule = angular.module("TimeModule", ['TabindexModule']);
        var configShowOnClickInput = (function () {
            var showOnClickInput;
            try {
                showOnClickInput = globalConfig.controls.time.showOnClickInput;
                if (angular.isUndefined(showOnClickInput)) {
                    showOnClickInput = true;
                }
            } catch (e) {
                showOnClickInput = true;
            }
            return showOnClickInput;
        }());
        ngModelListener = function ($scope, $ctrl, value) {
            if (angular.isDefined($ctrl)) {
                if ($scope.defaultSecond) {
                    value += ":" + $scope.defaultSecond;
                }
                if ($scope.$root.$$phase) {
                    return $ctrl.$setViewValue(value);
                } else {
                    return $scope.$apply(function () {
                        return $ctrl.$setViewValue(value);
                    });
                }
                //if ($ctrl.$viewValue !== value) {
                //}
            }
        };
        TimeHandler = {

            /*处理时间中的小时输入 */
            handlerHour: function (timeStr, format) {
                var value;
                value = timeStr.replace(/(\d{1,2})([^0-9]*)?(.*)/, function () {
                    var hour, hourNum, hourSeparate, minuteStr;
                    hour = arguments[1];
                    hourSeparate = arguments[2];
                    minuteStr = arguments[3];
                    if (minuteStr) {
                        minuteStr = TimeHandler.handlerMinute(minuteStr, format);
                        hourSeparate = ':';
                    }
                    if (hourSeparate === ":") {
                        if (hour.length === 1) {
                            return "0" + hour + hourSeparate + minuteStr;
                        } else {
                            hourNum = parseInt(hour, 10);
                            if (/(H+)/.test(format)) {
                                if (hourNum > 23) {
                                    hour = "0" + parseInt(hourNum / 10, 10);
                                }
                            } else {
                                if (hourNum > 11) {
                                    hour = "0" + parseInt(hourNum / 10, 10);
                                }
                            }
                            return "" + hour + hourSeparate + minuteStr;
                        }
                    } else {
                        if (hour.length === 1) {
                            return "" + hour;
                        } else {
                            hourNum = parseInt(hour, 10);
                            if (/(H+)/.test(format)) {
                                if (hourNum > 23) {
                                    hour = "0" + parseInt(hourNum / 10, 10);
                                }
                            } else {
                                if (hourNum > 11) {
                                    hour = "0" + parseInt(hourNum / 10, 10);
                                }
                            }
                        }
                        return hour;
                    }
                });
                return value;
            },

            /*处理时间中的分钟输入 */
            handlerMinute: function (value, format) {
                value = value.replace(/(\d{1,2})([^0-9]*)?(.*)/, function () {
                    var minute, minuteSeparate, secondStr, minuteNum;
                    minute = arguments[1];
                    minuteSeparate = "";
                    secondStr = arguments[3];
                    if (secondStr && /(s+)/.test(format)) {
                        secondStr = TimeHandler.handlerSecond(secondStr);
                        minuteSeparate = ':';
                    }
                    if (minuteSeparate === ":") {
                        if (minute.length === 1) {
                            return "0" + minute + minuteSeparate + secondStr;
                        } else {
                            minuteNum = parseInt(minute, 10);
                            if (minuteNum > 59) {
                                minute = "0" + (parseInt(minute / 10, 10));
                            }
                            return "" + minute + minuteSeparate + secondStr;
                        }
                    } else {
                        if (minute.length === 1) {
                            return "" + minute;
                        } else {
                            minuteNum = parseInt(minute, 10);
                            if (minuteNum > 59) {
                                minute = "0" + (parseInt(minute / 10, 10));
                            }
                            return "" + minute;
                        }
                    }
                });
                return value;
            },

            /*处理时间中的秒输入 */
            handlerSecond: function (value) {
                value = value.replace(/(\d{1,2})([^0-9]*)?(.*)/, function () {
                    var second, secondNum;
                    second = arguments[1];
                    if (second.length === 1) {
                        return "" + second;
                    } else {
                        secondNum = parseInt(second, 10);
                        if (secondNum > 59) {
                            second = "0" + (parseInt(second / 10, 10));
                        }
                    }
                    return "" + second;
                });
                return value;
            }

        };

        TimeModule.directive("gTime", function ($filter, $rootScope, $compile, $parse, $tabindex, $timeout) {
            var template;
            template = "<div class=\"form-time\" verify-target outer-container>\n    <input\n            outer-container\n            ng-disabled=\"ngDisabled||disabled\"\n            ng-dblclick=\"selectInputText()\"\n            ng-blur=\"confirmTime($event)\"\n            ng-click=\"showTimepane()\"\n            ng-keypress=\"preventTypeLetter($event)\"\n            type=\"text\"\n            class=\"form-text\"\n            ng-keyup=\"typeTime($event)\"\n            ng-focus=\"showTimepaneOnFocus()\">\n    <a type=\"button\" class=\"btn\" ng-click=\"showTimepane($event)\"> <i class=\"fi fi-time\"></i> </a></div>";
            return {
                restrict: "E",
                scope: {
                    defaultTime: "@",
                    pattern: "@",
                    defaultSecond: "@",
                    width: "@",
                    cssClass: "@",
                    cssStyle: "@",
                    ngDisabled: "=",
                    disabled: "="
                },
                require: ["^?ngModel"],
                replace: true,
                template: template,
                controller: function ($scope, $element) {
                    var inputElement = $element.find("input");
                    /*为控件注册tabIndex服务 */
                    $tabindex.register(inputElement, $element);
                },
                link: function ($scope, $element, $attrs, $ctrl) {
                    var $ngModel = $ctrl[0],
                        defaultTime = $scope.defaultTime,
                        inputElement = $element.find("input"),
                        isHour24 = true,
                        value,
                        showOnClickInput = configShowOnClickInput,
                        getTimePane = function () {
                            if (angular.isUndefined($rootScope.$timePane)) {
                                $rootScope.$timePane = $timePane = new TimePane($compile, $rootScope, $parse);
                            }
                            return $rootScope.$timePane;
                        }, bindFocusHandler = function () {
                            if (angular.isUndefined($attrs.showOnFocus)) {
                                if (globalConfig.controls.time && angular.isDefined(globalConfig.controls.time["showOnFocus"])) {
                                    $attrs.showOnFocus = globalConfig.controls.time["showOnFocus"];
                                } else {
                                    $attrs.showOnFocus = true;//默认为跳转即显示
                                }
                            }
                            $scope.showTimepaneOnFocus = function () {
                                if ($attrs.showOnFocus) {
                                    $scope.showTimepane();
                                } else {
                                    getTimePane().hideTimePane();
                                }
                                inputElement.select();
                            };
                        }, disabledHandler = function () {
                            if ($attrs.disabled === 'disabled') {
                                $scope.disabled = true;
                            }

                            $scope.$watch("ngDisabled", function (newVal, oldVal) {
                                if (newVal === "disabled") {
                                    return $element.attr("disabled", "disabled");
                                } else {
                                    return $element.removeAttr("disabled");
                                }
                            });
                        }, copyAttribute = function () {
                            if (angular.isDefined($attrs.name)) {
                                inputElement.attr("name", $attrs.name);
                                $element.removeAttr("name");
                            }
                            /*CSS，style，width处理 */
                            if (angular.isDefined($scope.width)) {
                                $element.css("width", $scope.width);
                            }
                            if (angular.isDefined($scope.cssClass)) {
                                $element.addClass($scope.cssClass);
                            }
                            if (angular.isDefined($scope.cssStyle)) {
                                $scope.cssStyle = $scope.$eval($scope.cssStyle);
                                for (var key in $scope.cssStyle) {
                                    value = $scope.cssStyle[key];
                                    $element.css(key, value);
                                }
                            }
                        };
                    if($attrs.ngModel){
                        inputElement.attr("id", $attrs.ngModel);
                    }
                    if ($attrs.showOnClickInput === 'false') {
                        showOnClickInput = false;
                    } else if (angular.isDefined($attrs.showOnClickInput)) {
                        showOnClickInput = true;
                    }
                    //绑定focus事件处理
                    bindFocusHandler();
                    //拷贝属性配置
                    copyAttribute();
                    //处理diabled和ngDisabled的绑定
                    disabledHandler();

                    /*默认日期处理 */
                    $scope.pattern = $scope.pattern || "HH:mm";
                    isHour24 = /H+/.test($scope.pattern);

                    /*双向绑定 */
                    if (angular.isDefined($ngModel)) {
                        $ngModel.$render = function () {
                            var showHour, showMinute, showSecond, timeInfos;
                            if (!this.$isEmpty(this.$viewValue)) {
                                value = this.$viewValue;
                                timeInfos = value.split(":");
                                showHour = parseInt(timeInfos[0], 10);
                                showMinute = parseInt(timeInfos[1], 10);
                                showSecond = parseInt(timeInfos[2], 10);
                                if (!showSecond) {
                                    showSecond = 0;
                                }
                                if (!isHour24 && showHour > 12) {
                                    showHour = parseInt(showHour / 12, 10);
                                }
                                showMinute = showMinute < 10 ? "0" + showMinute : "" + showMinute;
                                showHour = showHour < 10 ? "0" + showHour : "" + showHour;
                                showSecond = showSecond < 10 ? "0" + showSecond : "" + showSecond;
                                ngModelListener($scope, $ngModel, value);
                                if (/(s+)/.test($scope.pattern)) {
                                    return $element.find(".form-text").val(showHour + ":" + showMinute + ":" + showSecond);
                                } else {
                                    return $element.find(".form-text").val(showHour + ":" + showMinute);
                                }
                            } else {
                                return $element.find(".form-text").val("");
                            }
                        };
                    }

                    $scope.showTimepane = function ($event) {
                        var date, showHour, showMinute, showSecond, timeInfos, clickIcon;
                        if ($event && $($event.target).is('i.fi-time')) {
                            clickIcon = true;
                        }
                        if (!($attrs.showOnFocus || showOnClickInput) && !clickIcon) {
                            return;
                        }
                        if (!$scope.disabled && !$scope.ngDisabled && $attrs.disabled !== "disabled" && $attrs.disabled !== "true") {
                            value = $element.find(".form-text").val();
                            if (!value) {

                                /*若值为空，则默认打开时间为设置的默认时间或当前时间 */
                                defaultTime = $scope.defaultTime;
                                if (angular.isUndefined(defaultTime)) {
                                    date = new Date();
                                    showHour = date.getHours();
                                    showMinute = date.getMinutes();
                                    showSecond = date.getSeconds();
                                } else {
                                    timeInfos = defaultTime.split(":");
                                    showHour = parseInt(timeInfos[0], 10);
                                    showMinute = parseInt(timeInfos[1], 10);
                                    showSecond = parseInt(timeInfos[2], 10);
                                }
                                if (!isHour24 && showHour > 12) {
                                    showHour = parseInt(showHour % 12, 10);
                                }
                                showSecond = showSecond < 10 ? "0" + showSecond : "" + showSecond;
                                showMinute = showMinute < 10 ? "0" + showMinute : "" + showMinute;
                                showHour = showHour < 10 ? "0" + showHour : "" + showHour;
                                value = showHour + ":" + showMinute + ":" + showSecond;
                            }
                            getTimePane().setSecondPane($scope.pattern);
                            getTimePane().refresh(value, $element, isHour24);
                            getTimePane().showTimepane();
                            getTimePane().change(function (value) {
                                $element.find(".form-text").val(value);
                                ngModelListener($scope, $ngModel, value);
                            });
                        }
                    };

                    /*阻止重复输入 */
                    $scope.preventTypeLetter = function ($event) {
                        var keyCode = $event.keyCode,
                            charCode = $event.charCode,
                            isFireFox = window.navigator.userAgent.indexOf("Firefox") != -1;
                        if (isFireFox) {
                            if(keyCode === 0 && !((charCode > 47 && charCode < 58) || (charCode === 58 && $event.shiftKey) || charCode === 32)) {
                                $event.preventDefault();
                                return;
                            }
                        } else {
                            if (!((keyCode > 47 && keyCode < 58) || (keyCode === 58 && $event.shiftKey) || keyCode === 32)) {
                                $event.preventDefault();
                                return;
                            }
                        }
                        if (this.keyflag) {
                            $event.preventDefault();
                        } else {
                            this.keyflag = true;
                        }
                    };


                    /*时间输入事件监听 */
                    $scope.typeTime = function ($event) {
                        this.keyflag = false;
                        if ($event.keyCode === 9) {
                            return;
                        }
                        var element = angular.element($event.srcElement || $event.target),
                            value = DBCUtils.toCDB(element.val()),
                            pos = CursorPositionUtil.getPosition(element),
                            orginLength = value.length,
                            newValue = TimeHandler.handlerHour(value, this.pattern),
                            nowLength = newValue.length,
                            injector = angular.element(document).injector(),
                            $rootScope = injector.get("$rootScope");
                        element.val(newValue);
                        if (newValue !== value) {
                            CursorPositionUtil.setPosition(element, pos + nowLength - orginLength);
                        }
                        if (newValue) {
                            getTimePane().refresh(newValue);
                        }
                        ngModelListener(this, $ngModel, newValue);                        
                        if ($event.keyCode === 40) {
                            if (getTimePane().element.is(':visible')) {
                                $event.stopPropagation();
                            }
                        }
                    };

                    $scope.confirmTime = function ($event) {
                        var element, value;
                        element = angular.element($event.srcElement || $event.target);
                        value = element.val();
                        if (/(s+)/.test($scope.pattern)) {
                            if (/^\d{2}:\d{2}:\d{1}$/.test(value)) {
                                if (value.substr(6, 1) == '0') {
                                    value = value.substr(0, 6) + "00";
                                } else {
                                    value = value.substr(0, 6) + "0" + value.substr(6, 1);
                                }
                                element.val(value);
                            }
                        } else {
                            if (/^\d{2}:\d{1}$/.test(value)) {
                                if (value.substr(3, 1) == '0') {
                                    value = value.substr(0, 3) + "00";
                                } else {
                                    value = value.substr(0, 3) + "0" + value.substr(3, 1);
                                }
                                element.val(value);
                            }
                        }
                        if (/(s+)/.test($scope.pattern)) {
                            if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
                                element.val("");
                                ngModelListener(this, $ngModel, "");
                            } else {
                                ngModelListener(this, $ngModel, value);
                            }
                        } else {
                            if (!/^\d{2}:\d{2}$/.test(value)) {
                                element.val("");
                                ngModelListener(this, $ngModel, "");
                            } else {
                                ngModelListener(this, $ngModel, value);
                            }
                        }
                    };


                    $scope.selectInputText = function () {
                        inputElement.select();
                    }

                    $scope.$on("$destroy", function () {


                        delete $ngModel;
                        delete defaultTime;
                        delete inputElement;
                        if ($rootScope.$timePane) {
                            getTimePane().destroy();
                        }

                    });
                }

            };
        });
        return TimeModule;
    });

}).call(this);
