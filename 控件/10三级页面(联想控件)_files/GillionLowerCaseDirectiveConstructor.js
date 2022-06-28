define('framework/control/GillionLowerCaseDirectiveConstructor', function () {
    return function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.css('text-transform', 'lowercase').on('blur', function (event) {
                    var val = element.val();
                    if (!!val) {
                        element.val(val.toLowerCase());
                    }
                });
            }
        }
    }

});