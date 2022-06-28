/**
 * Created with IntelliJ IDEA.
 * User: liaowj
 * Date: 2014/12/11
 * Time: 16:47
 */
define('framework/directive/GillionResourceConstructor', [], function () {
    return function (Resource, ResourceService) {

        function getDefRestfulServiceName(controllerName) {
            return getDefEntityName(controllerName) + 's';
        }

        function getDefEntityName(controllerName) {
            var matched = controllerName.match(/(\w+)Controller$/);
            if (matched) {
                return matched [1];
            }
        }

        return {
            restrict: 'A',
            require: '?ngController',
            link: {
                pre: function (scope, element, attrs) {
                    var basePath = window.basePath || '';

                    var resourceInitCallback = attrs.resourceInitCallback,
                        url = basePath + attrs['gResource'],
                        controllerName = attrs['ngController'],
                        methodsName = attrs['methodsNameInScope'] || 'resourceMethods',
                        resourceName = attrs['resourceName'] || getDefRestfulServiceName(controllerName),
                        methods = scope[methodsName],
                        tokens = url.match(/:\w+/g),
                        resourceArgs = [url],
                        i, len, token, pathVariables, pathVariable;
                    if (angular.isArray(tokens) && tokens.length > 0) {
                        pathVariables = {};
                        for (i = 0, len = tokens.length; i < len; i++) {
                            token = tokens[i];
                            pathVariable = token.substring(1);
                            pathVariables[pathVariable] = '@' + pathVariable;
                        }
                        resourceArgs.push(pathVariables);
                    }
                    if (angular.isObject(methods)) {
                        resourceArgs.push(methods);
                    }

                    scope[resourceName] = Resource.apply(window, resourceArgs);
                    if (resourceInitCallback && angular.isFunction(scope[resourceInitCallback])) {
                        scope[resourceInitCallback](scope[resourceName]);
                    }
                }
            },
            controller: ['$scope', '$attrs', function ($scope, $attrs) {
                var controllerName = $attrs['ngController'],
                    resourceName = $attrs['resourceName'] || getDefRestfulServiceName(controllerName);

                /**
                 * 获取Restful资源服务
                 * @return {GillionResource}
                 */
                this.getResources = function () {
                    return $scope[resourceName];
                };

                /**
                 * 获取默认的实体名称， 根据controller而来， 比如ControllerName=`UserController`, 实体名称则为`User`
                 * @return {String} 实体名称
                 */
                this.getDefEntityName = function () {
                    return getDefEntityName(controllerName);
                };

                /**
                 *  获取默认的Restful服务名称
                 * @return {String}  默认的Restful服务名称
                 */
                this.getDefRestfulServiceName = function () {
                    return getDefRestfulServiceName(controllerName);
                };
            }]
        }
    };
});