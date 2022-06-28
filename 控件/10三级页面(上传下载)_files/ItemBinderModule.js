define('framework/commons/ItemBinderModule', ['angular'], function (angular) {

    var regFunctionCall = /\([$\w]+(?:,\s*[$\w]+)*\)$/;

    function OuterScope(scope, $parse, outerScopeDef) {
        var me = this,
            outerScopeGetter;
        me.$parse = $parse;
        me.eventCache = {};
        if (!!outerScopeDef) {
            outerScopeGetter = $parse(outerScopeDef);
        } else {
            outerScopeGetter = angular.identity;
        }
        me.outerScope = outerScopeGetter(scope);
    }

    OuterScope.prototype = {

        get: function () {
            return this.outerScope;
        },

        getEvent: function (eventDef) {
            var me = this,
                $parse = me.$parse,
                outerScope = me.outerScope,
                eventCache = me.eventCache;
            if (!!eventDef) {
                if (!eventCache[eventDef]) {
                    var parentGet = $parse(eventDef);
                    eventCache[eventDef] = function (locals) {
                        return parentGet(outerScope, locals);
                    };
                }
                return eventCache[eventDef];
            }
            return angular.noop;
        }
    };

    function concatClasses(classVal) {
        if (angular.isArray(classVal)) {
            return classVal.join(' ');
        } else if (angular.isString(classVal)) {
            return classVal;
        } else if (angular.isObject(classVal)) {
            var classes = [], i = 0;
            angular.forEach(classVal, function (v, k) {
                if (v) {
                    classes.push(k);
                }
            });
            return classes.join(' ');
        }
        return '';
    }

    function isEmptyObject(object) {
        var prop;
        if (angular.isObject(object)) {
            //noinspection LoopStatementThatDoesntLoopJS
            for (prop in object) {
                return false;
            }
        }
        return true;
    }

    function getLocals(localsDef, scope) {
        var localNames, locals = {};
        // example : 'param1,param2,param$' ,not allow space
        if (localsDef) {
            if (/^[$\w]+(?:,[$\w]+)*$/.test(localsDef)) {
                localNames = localsDef.split(',');
                if (angular.isArray(localNames) && localNames.length > 0) {
                    angular.forEach(localNames, function (localName) {
                        locals[localName] = scope[localName];
                    });
                }
            } else {
                locals = scope.$eval(localsDef);
            }
        }
        return locals;
    }

    angular.module('ItemBinderModule', [])
        .directive('gItemClass', function () {
            return {
                retract: 'A',
                controller: ['$attrs', function ($attrs) {
                    var gItemClass = $attrs.gItemClass;

                    return function (params) {
                        var scope = params.scope,
                            outerScopeController = params.outerScopeController,
                            locals = params.locals,
                            gItemClassGetter, oldClasses;
                        if (isEmptyObject(locals)) {
                            locals = scope;
                        }
                        if (regFunctionCall.test(gItemClass)) {
                            gItemClassGetter = outerScopeController.getEvent(gItemClass);
                            scope.$watch(function () {
                                return gItemClassGetter(locals);
                            }, itemClassAction);
                        } else {
                            scope.$watch(gItemClass, itemClassAction, true);
                        }

                        function itemClassAction(newVal){
                            var itemAttrs = params.attrs,
                                newClasses = concatClasses(newVal);
                            if (!oldClasses) {
                                itemAttrs.$addClass(newClasses);
                            } else if (newClasses !== oldClasses) {
                                itemAttrs.$updateClass(newClasses, oldClasses);
                            }
                            oldClasses = newClasses;
                        }
                    };
                }]
            }
        })
        .directive('renderItemClass', function ($parse) {
            return {
                retract: 'A',
                require: ['^?gItemClass', 'outerScope'],
                link: function (scope, element, attrs, controllers) {
                    var gItemClassController = controllers[0],
                        outerScopeController = controllers[1],
                        gItemClassDef = attrs['renderItemClass'],
                        renderItemClassLocals = attrs['renderItemClassLocals'],
                        locals = getLocals(renderItemClassLocals, scope);
                    if (gItemClassDef) {
                        gItemClassController = $parse(gItemClassDef)(scope);
                    }
                    if (angular.isFunction(gItemClassController)) {
                        gItemClassController({
                            locals: locals,
                            scope: scope,
                            attrs: attrs,
                            outerScopeController: outerScopeController
                        });
                    }
                }
            }
        })
        .directive('outerScope', function ($parse) {
            return {
                retract: 'A',
                controller: ['$scope', '$attrs', function ($scope, $attrs) {
                    var outerScopeDef = $attrs['outerScope'];
                    return new OuterScope($scope, $parse, outerScopeDef);
                }]
            }
        })
        .directive('gItemDisabled', function () {
            return {
                retract: 'A',
                controller: ['$attrs', function (attrs) {
                    var gItemDisabled = attrs.gItemDisabled;
                    return function (params) {
                        var scope = params.scope,
                            outerScopeController = params.outerScopeController,
                            locals = params.locals,
                            element = params.element,
                            gItemDisabledGetter;
                        if (isEmptyObject(locals)) {
                            locals = scope;
                        }
                        if (regFunctionCall.test(gItemDisabled)) {
                            gItemDisabledGetter = outerScopeController.getEvent(gItemDisabled);
                            scope.$watch(function () {
                                return gItemDisabledGetter(locals);
                            }, itemDisabledAction);
                        } else {
                            scope.$watch(gItemDisabled, itemDisabledAction, true);
                        }

                        function itemDisabledAction(newVal, params) {
                            if (newVal === true) {
                                element.attr('disabled', 'disabled');
                            }else {
                                element.removeAttr('disabled');
                            }
                        }
                    };

                }]
            }
        })
        .directive('renderItemDisabled', function ($parse) {
            return {
                require: ['^?gItemDisabled', 'outerScope'],
                link: function (scope, element, attrs, controllers) {
                    var gItemDisabledController = controllers[0],
                        outerScopeController = controllers[1],
                        gItemDisabledDef = attrs['renderItemDisabled'],
                        renderItemDisabledLocals = attrs['renderItemDisabledLocals'],
                        locals = getLocals(renderItemDisabledLocals, scope);
                    if (gItemDisabledDef) {
                        gItemDisabledController = $parse(gItemDisabledDef)(scope);
                    }
                    if (angular.isFunction(gItemDisabledController)) {
                        gItemDisabledController({
                            locals: locals,
                            scope:scope,
                            element: element,
                            outerScopeController: outerScopeController
                        });
                    }
                }
            };
        });
});