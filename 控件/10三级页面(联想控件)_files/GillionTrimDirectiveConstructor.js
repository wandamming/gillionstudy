define('framework/control/GillionTrimDirectiveConstructor', function () {
    return function () {
        return {
            restrict: 'A',
            require:'?^ngModel',
            link: function ($scope, $element, $attrs ,ngModel) {
                function func() {
                    var gTrim,newValue,render,oldValue,keepNewline,trimStr,reg;
                    gTrim = $attrs.gTrim;
                    render = $attrs.render || 'true';
                    oldValue = $element.val();
                    keepNewline = $attrs.keepNewline === 'true' || $attrs.keepNewline === '';
                    trimStr = keepNewline ? '( |　|\\t|\\v)+' : '\\s+';
                    if(gTrim !== undefined){
                        if(gTrim==="ltrim"){
                            reg = new RegExp('^' + trimStr, 'g');
                        }else if(gTrim==="rtrim"){
                            reg = new RegExp(trimStr + '$', 'g');
                        }else if(gTrim==='atrim'){
                            reg = new RegExp(trimStr, 'g');
                        }else if(gTrim === "" || gTrim === "trim"){
                            reg = new RegExp('^' + trimStr + '|' + trimStr + '$', 'g');
                        }
                        newValue = oldValue.replace(reg, '');
                    }
                    if(oldValue!==newValue){
                        $element.val(newValue);
                        if(ngModel && render==='true'){
                            ngModel.$setViewValue(newValue);
                        }
                        if (!$scope.$$phase) {
                            $scope.$digest();
                        }
                    }
                }
                $element.on('blur.trim', function () {
                    func();
                });
                func();
            }
        }
    }
});