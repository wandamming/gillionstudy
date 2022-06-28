/**
 * Created with IntelliJ IDEA.
 * User: liaowj
 * Date: 2014/12/10
 * Time: 16:18
 */
define('framework/date/GillionDateRangeConstructor', [], function() {
    return function() {
        return {
            restrict: 'A',
            scope: {},
            controller: function($scope, $element) {
                return {
                    getGDateElement: function() {
                        return $element.find('[g-date]');
                    },
                    initStart: function(config, ngModel, scope) {
                        $scope.startConfig = config;
                    },
                    initEnd: function(config, ngModel, scope) {
                        $scope.endConfig = config;
                    },
                    setStart: function(datas, ngModel, scope) {
                        if ($scope.endConfig) {
                            $scope.endConfig.min = datas; //开始日选好后，重置结束日的最小日期
                            $scope.endConfig.start = datas //将结束日的初始值设定为开始日
                        }
                    },
                    setEnd: function(datas, ngModel, scope) {
                        if ($scope.startConfig) {
                            $scope.startConfig.max = datas;
                        }
                    }

                }
            }
        };
    };
});