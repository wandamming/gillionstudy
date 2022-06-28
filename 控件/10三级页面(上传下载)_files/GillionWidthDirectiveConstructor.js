define('framework/control/GillionWidthDirectiveConstructor', function () {
    return function () {
        return {
            restrict: 'A',
            link: function (scope, element,attrs) {
                var width = attrs.gWidth;
                //常用网页单 % in cm mm pt pc ex em px
                //单位正则表达式
                var unitRegExp = /^(([0-9]+)|([0-9]+\.[0-9]+))(%|in|cm|mm|pt|pc|ex|em|px)?$/g;
                if(unitRegExp.test(width)){
                    element.css("width",width);
                }else{
                    throw "宽度设置错误";
                }
            }
        }

    }
});