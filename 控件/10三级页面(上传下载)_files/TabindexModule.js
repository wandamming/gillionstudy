// Generated by CoffeeScript 1.9.3
(function () {
    define(["angular", "angular-underscore"], function (angular) {
        var TabindexModule, protosomaticContainer, protosomaticControl, loaded;
        TabindexModule = angular.module("TabindexModule", ["angular-underscore"]);

        /*默认可进行跳转的标签 */
        protosomaticControl = ["input", "select", "checkbox", "radio" , "button"];

        /*默认容器 */
        protosomaticContainer = ["div", "form", "body"];

        loaded = false;

        /*1.注册服务 */
        TabindexModule.factory("$tabindex", function ($compile, $timeout, $rootScope) {
            var $tabindex, ignoreContainers, tabindexQueue, ignoreEvents, resetTimer, callbackList;
            tabindexQueue = [];
            ignoreContainers = [];
            ignoreEvents = [];
            callbackList = [];

            var getIgnoreEvent = function ($element) {
                for (var i = 0; i < ignoreEvents.length; i++) {
                    if ($element.is(ignoreEvents[i]["control"])) {
                        return ignoreEvents[i];
                    }
                }
            };
            var isInterrupt = false;
            $tabindex = {

                /**
                 * 注册满足于特定条件下跳过回车的事件
                 */
                registerIgnoreEvent: function ($element, ignoreEvent, $scope) {
                    ignoreEvents.push({"control": $element, "$event": ignoreEvent, "$scope": $scope});
                },
                registerGlobalEvent: function () {
                    if (!loaded) {
                        angular.element(document).on("DOMNodeInserted DOMNodeRemoved", function (event) {
                            var target = event.srcElement || event.target;
                            target = angular.element(target);
                            if (target.find(protosomaticControl.join(",") + ",[g-tabindex]").length > 0) {
                                if (resetTimer) {
                                    $timeout.cancel(resetTimer);
                                    resetTimer = $timeout(function () {
                                        $tabindex.reset();
                                        resetTimer = null;
                                    });
                                } else {
                                    resetTimer = $timeout(function () {
                                        $tabindex.reset();
                                        resetTimer = null;
                                    });
                                }
                            }
                        });
                        setInterval(function () {
                            //检查gtabindex是否有值，若出现没值得情况，重置
                            if (resetTimer == null) {
                                var elements = angular.element("[g-tabindex]");
                                for (var i = 0; i < elements.length; i++) {
                                    var element = angular.element(elements[i]);
                                    if (element.attr("g-tabindex") === "") {
                                        $tabindex.reset();
                                        break;
                                    }
                                }
                            }
                        }, 2000);
                        loaded = true;
                    }
                },
                registerCallBack: function (callback) {
                    if(_.isFunction(callback) && !_.contains(callbackList, callback))callbackList.push(callback);
                },
                interrupt: function () {
                    isInterrupt = true;
                },
                /*注册一个回车调整，通常用于自定义控件 */
                register: function ($element, $container) {
                    var tabindex, tabindexIgnore, tabindexPrevent;
                    if ($element != $container) {
                        if ($container) {
                            tabindex = $container.attr("g-tabindex");
                            if (tabindex) {
                                $element.attr("g-tabindex", tabindex);
                            } else {
                                $element.attr("g-tabindex", "");
                            }
                            tabindexIgnore = $container.attr("g-tabindex-ignore");
                            tabindexPrevent = $container.attr('g-tabindex-prevent');
                            if (tabindexIgnore) {
                                $element.attr("g-tabindex-ignore", tabindexIgnore);
                                $container.removeAttr("g-tabindex-ignore");
                            }
                            if (tabindexPrevent !== void 0) {
                                $element.attr("g-tabindex-prevent", tabindexPrevent);
                                $container.removeAttr("g-tabindex-prevent");
                            }
                            ignoreContainers.push($container);
                            $container.removeAttr("g-tabindex");
                        }
                    }
                },

                /*注册一个回车跳转容器 */
                registerContainer: function (container) {
                    tabindexQueue.push({
                        container: container,
                        tabindexQueue: []
                    });
                },

                /*是否忽略容器 */
                isIgnoreContainer: function (container) {
                    return _.indexOf(ignoreContainers, container) !== -1;
                },

                /*获取容器 */
                getContainer: function ($element) {
                    var containers, self;
                    self = this;
                    containers = _.filter(tabindexQueue, function (tabindexEle) {
                        if (tabindexEle.container) {
                            if (tabindexEle.container.find($element).length > 0) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    });
                    if (containers.length > 0) {
                        return containers[0].container;
                    } else {
                        return void 0;
                    }
                },

                /*获取对应容器的回车调转队列 */
                getTabindexQueue: function (container) {
                    var containers, self;
                    self = this;
                    containers = _.filter(tabindexQueue, function (tabindexEle) {
                        if (tabindexEle.container) {
                            return tabindexEle.container === container;
                        }
                    });
                    if (containers.length > 0) {
                        return containers[0].tabindexQueue;
                    }
                    return void 0;
                },

                /*清除垃圾队列 */
                cleanContainer: function () {
                    _.forEach(ignoreContainers, function (ignoreContainer) {
                        var containers, i, j, ref;
                        containers = _.filter(tabindexQueue, function (container) {
                            return ignoreContainer === container.tabindexQueue;
                        });
                        for (i = j = 0, ref = tabindexQueue.length - 1; j <= ref; i = j += 1) {
                            if (tabindexQueue[i].container === ignoreContainer) {
                                tabindexQueue.splice(i, 1);
                                break;
                            }
                        }
                    });
                },

                /*是否是回车跳转容器 */
                isContainer: function ($element) {
                    return $element.is(protosomaticContainer.join(","));
                },

                /*编译回车跳转 */
                compile: function ($element, container) {
                    var _tabIndexQueue, tabindex;
                    tabindex = $element.attr("g-orginal-tabindex");
                    if (angular.isDefined(container)) {
                        _tabIndexQueue = this.getTabindexQueue(container);
                    }
                    if (_tabIndexQueue) {
                        if (tabindex) {
                            $element.attr("g-tabindex", tabindex);
                            $element.attr("g-orginal-tabindex", tabindex);
                            tabindex = parseInt(tabindex, 10);
                            if (_tabIndexQueue[tabindex]) {
                                if (angular.isArray(_tabIndexQueue[tabindex])) {
                                    _tabIndexQueue[tabindex].push($element[0]);
                                } else {
                                    _tabIndexQueue[tabindex] = [_tabIndexQueue[tabindex], $element[0]];
                                }
                            } else {
                                _tabIndexQueue[tabindex] = $element[0];
                            }
                        } else {
                            for(var i = 0 ; i < _tabIndexQueue.length+1;i++){
                                if(angular.isUndefined(_tabIndexQueue[i])){
                                    $element.attr("g-tabindex", i);
                                    _tabIndexQueue[i] = $element[0];
                                    break;
                                }
                            }

                        }
                    }
                },

                /*回车跳转到下一个控件 */
                next: function ($element) {
                    var _tabindexQueue, container, currentEle, i, j, k, l, nextEle, ref, ref1, ref2, ref3, ref4, tabindex;
                    if (isInterrupt) {
                        isInterrupt = false;
                        return;
                    }
                    tabindex = $element.attr("g-tabindex");
                    tabindex = parseInt(tabindex, 10);
                    container = this.getContainer($element);
                    if (container) {
                        _tabindexQueue = this.getTabindexQueue(container);
                        currentEle = _tabindexQueue[tabindex];
                        nextEle = void 0;
                        if (angular.isArray(currentEle)) {
                            for (i = j = 0, ref = currentEle.length - 1; j < ref; i = j += 1) {
                                if (currentEle[i] === $element[0]) {
                                    nextEle = currentEle[i + 1];
                                    break;
                                }
                            }
                            if (angular.isUndefined(nextEle)) {
                                for (i = k = ref1 = tabindex + 1, ref2 = _tabindexQueue.length; k < ref2; i = k += 1) {
                                    if (angular.isDefined(_tabindexQueue[i])) {
                                        if (angular.isArray(_tabindexQueue[i])) {
                                            nextEle = _tabindexQueue[i][0];
                                        } else {
                                            nextEle = _tabindexQueue[i];
                                        }
                                        break;
                                    }
                                }
                            }
                        } else {
                            nextEle = _tabindexQueue[tabindex + 1];
                            if (angular.isArray(nextEle)) {
                                nextEle = nextEle[0];
                            }
                            if (angular.isUndefined(nextEle)) {
                                for (i = l = ref3 = tabindex + 1, ref4 = _tabindexQueue.length; l < ref4; i = l += 1) {
                                    if (angular.isDefined(_tabindexQueue[i])) {
                                        if (angular.isArray(_tabindexQueue[i])) {
                                            nextEle = _tabindexQueue[i][0];
                                        } else {
                                            nextEle = _tabindexQueue[i];
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        if (nextEle) {
                            if (nextEle.getAttribute("type") == "hidden"
                                || nextEle.style.display == "none"
                                || nextEle.hasAttribute("hidden")
                                || nextEle.readOnly
                                || nextEle.disabled
                                || $(nextEle).is(':hidden')
                            ) {
                                this.next(angular.element(nextEle));
                            } else {
                                nextEle = angular.element(nextEle);
                                var ignoreEvent = getIgnoreEvent(nextEle);

                                if (ignoreEvent) {
                                    if (angular.isFunction(ignoreEvent["$event"](ignoreEvent["$scope"]))) {
                                        if (ignoreEvent["$event"](ignoreEvent["$scope"])()) {
                                            this.next(nextEle);
                                            return;
                                        } else {
                                            angular.element(nextEle).focus();
                                            angular.element(nextEle).select();
                                        }
                                    } else {
                                        if (ignoreEvent["$event"](ignoreEvent["$scope"])) {
                                            this.next(nextEle);
                                            return;
                                        } else {
                                            angular.element(nextEle).focus();
                                            angular.element(nextEle).select();
                                        }
                                    }

                                } else {
                                    angular.element(nextEle).focus();
                                    angular.element(nextEle).select();
                                }

                                _.each(callbackList, function (callback) {
                                    callback();
                                });
                            }

                        }
                    }
                },

                reset: function () {
                    var _this = this;
                    _.forEach(tabindexQueue, function (tabindexEle) {
                        if (tabindexEle.container) {
                            tabindexEle.tabindexQueue = [];
                            var elements = tabindexEle.container.find(protosomaticControl.join(",") + ",[g-tabindex]");
                            for (var i = 0; i < elements.length; i++) {
                                var ele = angular.element(elements[i]);
                                _this.compile(ele, tabindexEle.container);
                            }
                        }
                    });
                },
                timer: void 0
            };

            /*注册全局事件 */
            angular.element(document).on("keyup", function ($event) {
                var element, keyCode, tabindex, prevent;
                keyCode = $event.keyCode;
                element = angular.element($event.srcElement || $event.target);
                if (keyCode === 13) {
                    if (element.is("[g-tabindex]")) {
                        tabindex = element.attr("g-tabindex");
                        var prevent = element.attr('g-tabindex-prevent');
                        if (prevent === void 0 || prevent === 'false' || prevent === false) {
                            $tabindex.next(element);
                        }
                    }
                }
            });
            return $tabindex;
        });
        /*2.注册指令 */
        TabindexModule.directive("gTabindex", function ($tabindex, $timeout, $compile, $rootScope, $parse) {
            return {
                restrict: "A",
                scope: false,
                priority: 0,
                controller: function ($scope, $element) {
                    var tagName;
                    tagName = $element[0].tagName.toLowerCase();

                    if($element.hasClass("grid")){
                        $tabindex.registerCallBack(function () {
                            $element.scope().grid._syncScroll();
                        })
                    }
                    if (_.indexOf(protosomaticContainer, tagName) !== -1) {
                        if ($tabindex.isIgnoreContainer($element)) {
                            return;
                        } else {
                            $tabindex.registerGlobalEvent();
                            $tabindex.registerContainer($element);
                        }
                        $timeout(function () {
                            var controls;
                            controls = $element.find(protosomaticControl.join(","));
                            if (controls.length > 0) {
                                _.forEach(controls, function (control) {
                                    control = angular.element(control);
                                    if (control.attr("type") !== "hidden") {
                                        if(angular.isUndefined(control.attr("g-tabindex"))){
                                            control.attr("g-tabindex", "");
                                        }else{
                                            control.attr("g-orginal-tabindex",control.attr("g-tabindex"));
                                        }
                                    }
                                });
                            }
                        });
                    }
                },
                compile: function ($element, $attrs, $transclude) {
                    return {
                        post: function ($scope, $element, $attrs) {
                            var tagName;
                            tagName = $element[0].tagName.toLowerCase();
                            if (_.indexOf(protosomaticContainer, tagName) !== -1) {
                                if ($tabindex.isIgnoreContainer($element)) {
                                    /*清除额外队列 */
                                    $tabindex.cleanContainer();
                                    return;
                                } else {
                                    var controls = $element.find(protosomaticControl.join(","));
                                    _.forEach(controls, function (control) {
                                        control = angular.element(control);
                                        var tabindex = control.attr("g-tabindex");
                                        if (!tabindex) {
                                            control.attr("g-tabindex", "");
                                        }else{
                                            control.attr("g-orginal-tabindex",control.attr(tabindex));
                                        }
                                    });
                                    /*使用timeout，页面初始化完成之后，再进行刷新队列信息 */
                                    $timeout(function () {
                                        var controls;
                                        controls = $element.find("[g-tabindex]");
                                        if (controls.length > 0) {
                                            _.forEach(controls, function (control) {
                                                var tabindex, tabindexIgnore;
                                                control = angular.element(control);
                                                tabindex = control.attr("g-tabindex");
                                                tabindex = parseInt(tabindex);
                                                tabindexIgnore = control.attr("g-tabindex-ignore");
                                                if (tabindexIgnore) {
                                                    $tabindex.registerIgnoreEvent(control, $parse(tabindexIgnore), $scope);
                                                }
                                                if (isNaN(tabindex)) {
                                                    $tabindex.compile(control, $element);
                                                } else {
                                                    control.attr("g-orginal-tabindex",tabindex);
                                                    $timeout(function () {
                                                        $tabindex.compile(control, $element);
                                                    });

                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    };
                }
            };
        });
        return TabindexModule;
    });

}).call(this);
