define('framework/utils/JQueryEvents', [
    'jquery'
], function ($) {
    return {
        bindFirst: function (element, name, fn) {
            var $element = $(element);
            $element.on(name, fn);

            // Thanks to a comment by @Martin, adding support for
            // namespaced events too.
            $element.each(function() {
                var handlers = $._data(this, 'events')[name.split('.')[0]];
                // take out the handler we just inserted from the end
                var handler = handlers.pop();
                // move it at the beginning
                handlers.splice(0, 0, handler);
            });
        }
    }
});