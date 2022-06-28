define('framework/directive/FieldValidatorDirectiveConstructor', ['angular'], function (angular) {
    return function () {
        return {
            restrict: 'A',
            require: ['^form', '^gValidator', '^?ngModel'],
            scope: false,
            link: function (scope, element, attributes, controllers) {
                var form = controllers[0],
                    gValidator = controllers[1],
                    ngModel = controllers[2],
                    originalName = ngModel.$name,
                    name = attributes.name;

                if (originalName != name && form.hasOwnProperty(originalName)) {
                    form.$removeControl(ngModel);
                    ngModel.$name = name;
                    form.$addControl(ngModel);
                    element.attr('name', name);
                }
                scope.$evalAsync(function () {
                    gValidator.forEachRulesValidator(ngModel);
                });
            }
        }
    };
});