/**
 * Created by huangzx on 2015/7/23.
 */
/**
 * Created by huangzx on 2015/7/20.
 */
define('framework/control/GillionCaseDirectiveConstructor', function(){
    return function(){
        return {
            restrict: 'A',
            require:'?^ngModel',
            link: function(scope, element, attrs, ngModel){
                var caseVal = attrs.gCase,
                    render = attrs.render || 'true';
                if (caseVal == 'upper') {
                    element.css('text-transform', 'uppercase').on('blur', function (event) {
                        var val = element.val();
                        if (!!val) {
                            element.val(val.toUpperCase());
                            if(ngModel && render==='true'){
                                ngModel.$setViewValue(val.toUpperCase());
                                scope.$apply();
                            }
                        }
                    });
                } else if(caseVal == 'lower'){
                    element.css('text-transform', 'lowercase').on('blur', function (event) {
                        var val = element.val();
                        if (!!val) {
                            element.val(val.toLowerCase());
                            if(ngModel && render==='true'){
                                ngModel.$setViewValue(val.toLowerCase());
                                scope.$apply();
                            }
                        }
                    });
                }
            }
        };
    };
});