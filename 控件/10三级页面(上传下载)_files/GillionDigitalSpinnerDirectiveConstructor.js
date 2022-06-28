define('framework/control/GillionDigitalSpinnerDirectiveConstructor', [
    'angular',
    'jquery'
], function (angular, $) {

    function wheel(obj, fn, useCapture) {
        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
        if (obj.attachEvent) //if IE (and Opera depending on user setting)
            obj.attachEvent("on" + mousewheelevt, handler, useCapture);
        else if (obj.addEventListener) //WC3 browsers
            obj.addEventListener(mousewheelevt, handler, useCapture);

        function handler(event) {
            var event = window.event || event;
            var delta = event.detail ? -event.detail / 3 : event.wheelDelta / 120;
            if (event.preventDefault)
                event.preventDefault();
            event.returnValue = false;
            return fn.apply(obj, [event, delta]);
        }
    }

    function getOldNumberDefaultZero(oldVal) {
        var oldVal = Number(oldVal);
        return isNaN(oldVal) ? 0 : oldVal;
    }

    return function ($timeout, $interval) {
        return {
            restrict: 'A',
            require: '?ngModel',
            scope: {
                disabledControl: '='
            },
            link: function (scope, element, attributes, ngModel) {
                element.wrap('<span class="digital-spinner"></span>');
                var $wrapper = element.parent(),
                    disabledControl = scope.disabledControl === true,
                    disabled = attributes.hasOwnProperty('disabled'),
                    $prev = $('<button data-role="prev">+</button>').appendTo($wrapper),
                    $next = $('<button data-role="next">-</button>').prependTo($wrapper),
                    step = angular.isDefined(attributes.step) ? Number(attributes.step) : 1,
                    min = angular.isDefined(attributes.min) ? Number(attributes.min) : 0,
                    max = angular.isDefined(attributes.max) ? Number(attributes.max) : NaN,
                    oldNumber, newVal, plus, less, timeout, interval;
                scope.$watch('disabledControl', function (newVal) {
                    disabledControl = newVal === true;
                    if (disabledControl) {
                        $prev.add($next).attr('disabled', 'disabled');
                        if (!disabled) {
                            element.attr('disabled', 'disabled');
                        }
                    } else {
                        $prev.add($next).removeAttr('disabled');
                        if (!disabled) {
                            element.removeAttr('disabled');
                        }
                    }
                });
                if (isNaN(step)) {
                    step = 1;
                }
                element.addClass('digital-spinner-input');
                if (ngModel) {
                    plus = function () {
                        $timeout(function () {
                            oldNumber = getOldNumberDefaultZero(ngModel.$viewValue);
                            newVal = oldNumber + step;
                            if (!isNaN(max) && newVal > max) return;
                            ngModel.$setViewValue(newVal);
                            ngModel.$render();
                        }, 0);
                    };
                    less = function () {
                        $timeout(function () {
                            oldNumber = getOldNumberDefaultZero(ngModel.$viewValue);
                            newVal = oldNumber - step;
                            if (!isNaN(min) && newVal < min) return;
                            ngModel.$setViewValue(newVal);
                            ngModel.$render();
                        });
                    }
                } else {
                    plus = function () {
                        oldNumber = getOldNumberDefaultZero(element.val());
                        newVal = oldNumber + step;
                        if (!isNaN(max) && newVal > max) return;
                        element.val(newVal);
                    };
                    less = function () {
                        oldNumber = getOldNumberDefaultZero(element.val());
                        newVal = oldNumber - step;
                        if (!isNaN(min) && newVal < min) return;
                        element.val(newVal);
                    }
                }
                $prev.on('mousedown', function () {
                    if (disabledControl) return;
                    plus();
                    timeout = $timeout(function () {
                        plus();
                        interval = $interval(function () {
                            plus();
                        }, 50);
                    }, 500);
                });
                $prev.on('mouseup', function () {
                    if (disabledControl) return;
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    if (interval) {
                        $interval.cancel(interval);
                    }
                });
                $next.on('mousedown', function () {
                    if (disabledControl) return;
                    less();
                    timeout = $timeout(function () {
                        less();
                        interval = $interval(function () {
                            less();
                        }, 50);
                    }, 500);
                });
                $next.on('mouseup', function () {
                    if (disabledControl) return;
                    if (timeout) {
                        $timeout.cancel(timeout);
                    }
                    if (interval) {
                        $interval.cancel(interval);
                    }
                });
                wheel(element[0], function (event, delta) {
                    if (disabledControl) return;
                    if (delta > 0) {
                        plus();
                    } else if (delta < 0) {
                        less();
                    }
                });
            }
        };
    };
});