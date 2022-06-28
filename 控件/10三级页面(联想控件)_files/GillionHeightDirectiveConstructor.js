define('framework/control/GillionHeightDirectiveConstructor', function () {
    return function () {
        return {
            restrict: 'A',
            link: function (scope,element,attrs) {
                var height = attrs.gHeight;
                //常用单位 % in cm mm pt pc ex em px
                //正则表达式
                var unitRegExp = /^([0-9]+|[0-9]+\.[0-9]+)(%|in|cm|mm|pt|pc|ex|em|px)?$/g;
                if(unitRegExp.test(height)){
                    element.css("height",height);
                }else{
                    throw "高度设置错误";
                }
            }
        }
    }
});