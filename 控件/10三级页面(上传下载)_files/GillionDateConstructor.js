/**
 * Created with IntelliJ IDEA.
 * User: liaowj
 * Date: 2014/12/10
 * Time: 15:44
 */
define('framework/date/GillionDateConstructor', ['angular', 'laydate'], function(angular, laydate) {
    return function() {
        function String2Boolean(val) {
            return 'true' === val;
        }

        function buildOptions(element, attrs, ngModel, scope) {
            var optionsConfig = {};
            optionsConfig.elem = element[0];
            if (!angular.isUndefined(attrs.format)) {
                optionsConfig.format = attrs.format;
            }
            if (!angular.isUndefined(attrs.istime)) {
                optionsConfig.istime = String2Boolean(attrs.istime);
            }
            if (!angular.isUndefined(attrs.isclear)) {
                optionsConfig.isclear = String2Boolean(attrs.isclear);
            }

            if (!angular.isUndefined(attrs.istoday)) {
                optionsConfig.istoday = String2Boolean(attrs.istoday);
            }
            if (!angular.isUndefined(attrs.issure)) {
                optionsConfig.issure = String2Boolean(attrs.issure);
            }
            if (!angular.isUndefined(attrs.festival)) {
                optionsConfig.festival = String2Boolean(attrs.festival);
            }
            if (!angular.isUndefined(attrs.min)) {
                optionsConfig.min = attrs.min;
            }
            if (!angular.isUndefined(attrs.max)) {
                optionsConfig.max = attrs.max;
            }
            if (!angular.isUndefined(attrs.start)) {
                optionsConfig.start = attrs.start;
            }
            if (!angular.isUndefined(attrs.startDay)) {
                optionsConfig.min = laydate.now(Number(attrs.startDay));
            }
            if (!angular.isUndefined(attrs.endDay)) {
                optionsConfig.max = laydate.now(Number(attrs.endDay));
            }
            optionsConfig.choose = function(datas) {
                if (ngModel) {
                    scope.$apply(function() {
                        ngModel.$setViewValue(datas)
                    });
                }
            };
            return optionsConfig;
        }


        return {
            restrict: 'A',
            require: ['?^gDateRange', '?ngModel'],
            scope: false,
            /**
             *
             * @param attrs
             * @param attrs.format {String} ???????????????: YYYY-MM-DD hh:mm:ss
             * @param attrs.istime {Boolean} ????????????????????????
             * @param attrs.isclear {Boolean} ??????????????????????????????
             * @param attrs.istoday {Boolean} ??????????????????????????????
             * @param attrs.issure {Boolean} ??????????????????????????????
             * @param attrs.festival {Boolean} ??????????????????
             * @param attrs.min {String} ????????????
             * @param attrs.max {String} ????????????
             * @param attrs.start {String} ????????????
             * @param attrs.startDay {Integer} ?????????????????????-1???????????????-2???????????????????????????
             * @param attrs.endDay {Integer} ??????????????????,+1???????????????+2???????????????????????????
             */
            link: function(scope, ele, attrs, required) {
                var dateRange = required[0],
                    ngModel = required[1];
                var optionConfig = buildOptions(ele, attrs, ngModel, scope);
                if (dateRange) {
                    var childEles = dateRange.getGDateElement();
                    if (childEles[0] === ele[0]) {
                        dateRange.initStart(optionConfig, ngModel, scope);
                    } else if (childEles[1] === ele[0]) {
                        dateRange.initEnd(optionConfig, ngModel, scope);
                    }
                }
                //????????????ngModel??????value????????????????????????
                if (attrs.value && ngModel) {
                    ngModel.$setViewValue(attrs.value);
                }
                ele.bind('click', function() {
                    laydate(optionConfig);
                });

                if (angular.isDefined(attrs.ngModel)) {
                    scope.$watch(attrs.ngModel, function(newVal, oldVal) {
                        if (dateRange) {
                            var childEles = dateRange.getGDateElement();
                            if (childEles[0] === ele[0]) {
                                dateRange.setStart(newVal,ngModel,scope);
                            }else if (childEles[1] === ele[0]) {
                                dateRange.setEnd(newVal,ngModel,scope);
                            }
                        }
                    });
                }

            }
        };
    };
});