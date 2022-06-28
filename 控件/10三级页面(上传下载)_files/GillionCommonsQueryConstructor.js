define('framework/directive/GillionCommonsQueryConstructor', function () {
    return function () {

        function getFormData($form) {
            var formData = {};
            $.each($form.serializeArray(), function (index, element) {
                formData[element.name] = element.value;
            });
            return formData;
        }

        return {
            restrict: 'A',
            require: ['^gResource', 'form'],
            link: {
                pre: function (scope, element, attrs, controllers) {
                    var gResourceController = controllers[0],
                        formController = controllers[1],
                        Resources = gResourceController.getResources(),
                        sourceName = attrs['gCommonsQuery'] || gResourceController.getDefRestfulServiceName().toLowerCase();

                    element.bind('submit', function () {
                        var query = function () {
                            scope[sourceName] = Resources.query(getFormData(element), function (results) {
                            });
                        };
                        if (angular.isFunction(formController.verify)) {
                            formController.verify();
                            if (formController.$valid) {
                                query();
                            }
                        } else {
                            query();
                        }
                    });
                }
            },
            controller: ['$element', function ($element) {
                this.getFormData = function () {
                    getFormData($element);
                };
            }]
        };
    };
});