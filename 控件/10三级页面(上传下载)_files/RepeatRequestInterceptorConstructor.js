define('framework/interceptors/RepeatRequestInterceptorConstructor', [
    'angular',
    'underscore',
    'config.properties'], function (angular, _, config, undefined) {
    return function ($q, $parse, $rootScope, AntPathMatcher, GillionMsg) {
        var requestedCache = {},
            interceptorConfig = config.controls.repeatRequestInterceptor,
            repeatMsgOptions = interceptorConfig.repeatMsgOptions,
            handleUrlPatterns = interceptorConfig.handleUrlPatterns,
            handleUrlMatchers = _.map(handleUrlPatterns, AntPathMatcher);

        function newRequestKey(action) {
            var userIdGetter = $parse(interceptorConfig.sessionUserIdProp),
                userId = userIdGetter($rootScope);
            return encodeURIComponent(action + _.now() + userId);
        }

        function unHandleUrl(url) {
            return !_.some(handleUrlMatchers, function (matcher) {
                return matcher(url)
            });
        }

        function isSuccess(response) {
            if (response.status !== 200) {
                return false;
            } else {
                var data = response.data;
                if (data && data.hasOwnProperty('success')) {
                    return data.success === true;
                }
            }
            return true;
        }

        function getReqDataStr(config) {
            var str = '';
            if (config.data){
                str += angular.toJson(config.data);
            }
            if (config.params){
                str+= angular.toJson(config.params);
            }
            return str;
        }

        return {
            'request': function (config) {
                var action = config.url,
                    reqDataStr, dataCacheKey, dataCacheVal, hasUrlParam, requestKeyUrlPartPrefix;
                if (unHandleUrl(action)) {
                    return config;
                }
                reqDataStr = getReqDataStr(config);
                dataCacheKey = action + reqDataStr;
                dataCacheVal = requestedCache[dataCacheKey];
                hasUrlParam = action.indexOf('?') !== -1;
                requestKeyUrlPartPrefix = (hasUrlParam ? '&': '?') + '__requestKey=';
                if (dataCacheVal) {
                    if (requestedCache[dataCacheKey].done){
                        config.url += (requestKeyUrlPartPrefix + dataCacheVal.requestKey);
                        requestedCache[dataCacheKey].done = false;
                    } else {
                        GillionMsg.alert(repeatMsgOptions.title, repeatMsgOptions.message);
                        // return undefined;
                        //throw repeatMsgOptions.message;
                        var rejectObj = $q.reject(repeatMsgOptions.message);
                        angular.extend(rejectObj, config);
                        return rejectObj;
                    }
                } else {
                    dataCacheVal = {
                        requestKey: newRequestKey(action),
                        done: false
                    };
                    requestedCache[dataCacheKey] = dataCacheVal;
                    config.url += (requestKeyUrlPartPrefix + dataCacheVal.requestKey);
                }
                return config;
            },
            'response': function (response) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                console.log(response);
                var url = response.config.url,
                    requestKeyMatched = url.match(/__requestKey=([^&]*)/),
                    requestKey, dataCacheKey;
                if (!requestKeyMatched) return response;
                    requestKey = requestKeyMatched[1];
                    dataCacheKey = _.findKey(requestedCache, function (value) {
                        return value.requestKey === requestKey;
                    });
                if (isSuccess(response)) {
                    delete requestedCache[dataCacheKey];
                } else {
                    requestedCache[dataCacheKey].done = true;
                }
                return response;
            },
            'responseError': function (rejection) {
                console.log("------------------------------------------->>>>>>>>");
                console.log(rejection);
                var config = rejection.config,
                    url = config.url,
                    requestKeyMatched = url.match(/__requestKey=([^&]*)/),
                    requestKey, dataCacheKey;
                if (!requestKeyMatched) return rejection;
                requestKey = requestKeyMatched[1];
                dataCacheKey = _.findKey(requestedCache, function (value) {
                    return value.requestKey === requestKey;
                });
                requestedCache[dataCacheKey].done = true;
                return $q.reject(rejection);
            }
        }
    };
});