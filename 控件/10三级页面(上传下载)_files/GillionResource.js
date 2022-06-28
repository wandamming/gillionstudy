/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/7
 * Time: 9:58
 */
define('framework/commons/GillionResource', ['angular', 'require', 'framework/commons/GillionResourceServiceConstructor', 'config.properties', 'underscore', 'angular-resource'], function (angular, require, GillionResourceServiceConstructor, config, _) {
    angular.module('GillionResource', ['ngResource'], ['$provide', '$httpProvider', function ($provide, $httpProvider) {

        $httpProvider.defaults.headers.common['X-Requested-With'] = "XMLHttpRequest";

        var mockData, urlPrefix, dir;
        var requestQueue = [];
        var delayTime = (function () {
            try {
                return config.controls.resource.httpRequestEventDelayTime;
            } catch (e) {
                return 0;
            }
        })();

        if (angular.hasOwnProperty('mockData') && angular.isObject(angular.mockData)) {
            mockData = angular.mockData;
            mockData.id = mockData.id || 1000;

            if (mockData.hasOwnProperty('urlPrefix') && angular.isString(mockData.urlPrefix)) {
                urlPrefix = mockData.urlPrefix;
            } else if (mockData.hasOwnProperty('dir') && angular.isString(mockData.dir)) {
                dir = mockData.dir;
                urlPrefix = require.toUrl(dir);
            }

            if (urlPrefix) {
                $httpProvider.interceptors.push(function ($q) {
                    return {
                        'request': function (config) {
                            switch (config.method) {
                                case 'GET':
                                    // 有后缀的链接跳过mock
                                    if (!/.*\.\w+$/.test(config.url)) {
                                        config.url = urlPrefix + config.url + '.json';
                                    }
                                    break;
                                default:
                                    config.nativeMethod = config.method;
                                    config.method = 'GET';
                                    config.url = urlPrefix + '/global/success.json';
                                    break;
                            }
                            return config;
                        },
                        'response': function (response) {
                            var config = response.config,
                                nativeMethod;
                            if (config.hasOwnProperty('nativeMethod') && !!config.nativeMethod) {
                                nativeMethod = config.nativeMethod;
                                switch (nativeMethod) {
                                    case 'POST':
                                        response.data = angular.copy(config.data);
                                        response.data.id = mockData.id;
                                        mockData.id += 1;
                                        break;
                                    case 'PUT':
                                        response.data = angular.copy(config.data);
                                        break;
                                }
                            }
                            return response;
                        }
                    };
                });
            }
        }

        $httpProvider.interceptors.push(function ($rootScope) {
            return {
                request: function (config) {
                    if (!delayTime) {
                        $rootScope.$broadcast('httpRequest', config);
                    } else {
                        addRequestQueue(config.url);
                        var _config = angular.copy(config);
                        setTimeout(function () {
                            var obj = _.find(requestQueue, function (o) {
                                return o.url === _config.url;
                            });
                            if (obj) {
                                $rootScope.$broadcast('httpRequest', _config);
                            } else {
                            }
                            removeRequestQueue(_config.url);
                        }, delayTime);
                    }
                    return config;
                },
                response: function (config) {
                    var url = config.url || config.config.url;
                    url = url.split('?')[0];
                    var now = +new Date();
                    if (!delayTime) {
                        $rootScope.$broadcast('httpResponse', config);
                    } else {
                        var obj = _.find(requestQueue, function (o) {
                            return o.url === url;
                        });
                        if (obj) {
                            if (now - obj.startTime < delayTime) {
                                removeRequestQueue(url);
                            } else {
                                $rootScope.$broadcast('httpResponse', config);
                            }
                        }
                    }
                    return config;
                },
                requestError: function (config) {
                    $rootScope.$broadcast('httpRequestError', config);
                    return config;
                },
                responseError: function (config) {
                    $rootScope.$broadcast('httpResponseError', config);
                    return config;
                }
            };
        });

        $provide.factory('Resource', ['$resource', function ($resource) {
            return function (url, params, methods) {

                var defaults = {
                    update: {method: 'put'},
                    create: {method: 'post'}
                }, resource;

                methods = angular.extend(defaults, methods);

                resource = $resource(url, params, methods);

                resource.prototype.$save = function () {
                    if (!this.id) {
                        return this.$create();
                    }
                    else {
                        return this.$update();
                    }
                };

                return resource;
            };
        }]);

        function addRequestQueue(url) {
            url = url.split('?')[0];
            var obj = _.find(requestQueue, function (o) {
                return o.url === url;
            });
            if (obj) {
                obj.startTime = +new Date();
            } else {
                requestQueue.push({url: url, startTime: +new Date()});
            }
        }

        function removeRequestQueue(url) {
            requestQueue = _.filter(requestQueue, function (o) {
                return o.url !== url;
            });
        }

        $provide.service('ResourceService', GillionResourceServiceConstructor);
        GillionResourceServiceConstructor.$inject = ['$q', '$rootScope'];
    }]);
});
