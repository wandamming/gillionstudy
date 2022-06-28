define(function () {
    return function () {
        function getMainWindow(win) {
            var href = win.location.href,
                mainWin = win;
            if (href.indexOf('__showUrl=true') > -1) {
                mainWin = getMainWindow(mainWin.parent);
            }
            return mainWin;
        }
        return {
            getMaxZIndex: function () {
                var _currZIndex = getMainWindow(window)._currZIndex || 9999;
                getMainWindow(window)._currZIndex = _currZIndex;
                return getMainWindow(window)._currZIndex++;
            }
        }
    }
});
