define('framework/control/GillionUpperCaseDirectiveConstructor', function () {
    return function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
                element.css('text-transform', 'uppercase').on('blur', function (event) {
                    var val = element.val();
                    if (!!val) {
                        element.val(val.toUpperCase());
                    }
                });
            }
        }
    }

});