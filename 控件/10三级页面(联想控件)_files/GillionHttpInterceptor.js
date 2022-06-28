define(['angular'], function (angular) {
    return function ($q, $log, $window, GillionMsg) {
        function getMainWindow(win) {
            var href = win.location.href,
                mainWin = win;
            if (href.indexOf('__showUrl=true') > -1) {
                mainWin = getMainWindow(mainWin.parent);
            }
            return mainWin;
        }

        function showErrorMsg(errorMessage) {
            var mainWindow = getMainWindow($window),
                _ErrorMsgBox = mainWindow._ErrorMsgBox;
            if (!_ErrorMsgBox) {
                mainWindow._ErrorMsgBox = GillionMsg.alert("操作失败", errorMessage, null, {
                    maxHeight: 600,
                    onClose: function () {
                        delete mainWindow._ErrorMsgBox;
                    }
                });
            } else {
                _ErrorMsgBox.setMsg(_ErrorMsgBox.getMsg() + '<br/>' + errorMessage);
            }
        }

        function getErrorMessage(responseData) {
            var originalErrorMessage = responseData.errorMessages;
            if (angular.isArray(originalErrorMessage)) {
                return originalErrorMessage.join('<br/>');
            } else if (angular.isString(originalErrorMessage)) {
                return originalErrorMessage;
            }
            $log.error('未知异常, responseData : ', responseData);
            return '未知异常, 请联系开发人员处理。';
        }

        function hasError(responseData) {
            return angular.isObject(responseData) && responseData.success === false;
        }

        function processError(response) {
            var responseData = response.data,
                requestConfig = response.config,
                errorMessage, failHandler;
            if (requestConfig) {
                failHandler = requestConfig.failHandler;
                if (angular.isFunction(failHandler)) {
                    failHandler(response);
                } else if (failHandler === false) {
                    return;
                }
            }
            errorMessage = getErrorMessage(responseData);
            showErrorMsg(errorMessage);
        }

        function doTransformSymbolResponse(response) {
            if (response.data.symbol === "RESULT_SYMBOL") {
                response.data = response.data.data;
            }
        }

        return {

            'response': function (response) {
                if (hasError(response.data)) {
                    processError(response);
                } else {
                    doTransformSymbolResponse(response);
                }
                return response;
            },

            'responseError': function (rejection) {
                if (hasError(rejection.data)) {
                    processError(rejection);
                }
                return $q.reject(rejection);
            }
        };
    };
});