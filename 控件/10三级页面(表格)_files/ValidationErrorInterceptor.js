define('framework/validation/ValidationErrorInterceptor', function () {
    return function ($q, ValidationErrorResponder) {

        function extractingGroup(reqConfig) {
            if (reqConfig.params && reqConfig.params['$v_group_name']) {
                return reqConfig.params['$v_group_name'];
            }
            if (reqConfig.data && reqConfig.data['$v_group_name']) {
                return reqConfig.data['$v_group_name'];
            }
            if (/[\?&]\$v_group_name=/.test(reqConfig.url)) {
                var matched = reqConfig.url.match(/[\?&]\$v_group_name=([^&]+)/),
                    groupName;
                if (matched) {
                    groupName = matched[1];
                    if (groupName) {
                        return decodeURIComponent(groupName);
                    }
                }
            }
        }

        function hasValidationError(response) {
            if (response.status === 412) {
                return response.data && response.data['fieldErrors'];
            }
            return false;
        }

        return {
            'response': function (response){
                var config, group, fieldErrors;
                if (hasValidationError(response)) {
                    fieldErrors = response.data['fieldErrors'];
                    config = response.config;
                    group = extractingGroup(config);
                    if (group) {
                        ValidationErrorResponder.res(group, fieldErrors);
                    }
                }
                return response;
            }
        };
    };
});