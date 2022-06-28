define('framework/control/GillionDBCDirectiveConstructor', function () {
    function toCDB(str) {
        var tmp = "",
            length = str.length,
            i;
        for (i = 0; i < length; i++) {
            if ((str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375)) {
                tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
            } else {
                tmp += String.fromCharCode(str.charCodeAt(i));
            }
        }
        /**modify by weng 全角空格转半角空格 2015-06-12 begin**/
        tmp = tmp.replace("　", " ");
        /**modify by weng 全角空格转半角空格 2015-06-12 begin**/
        return tmp
    }

    function getCursorPosition(el) {
        var pos = 0, ele = el[0];
        if ("selectionStart" in ele) {
            pos = ele.selectionStart;
        } else if ('selection' in document) {
            ele.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -ele.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    }

    function setCaretPosition(ctrl0, pos) {//设置光标位置函数
        var ctrl = ctrl0[0];
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    return function ($timeout) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                var val, timer, pos, render = attrs.render || 'true', length = 0;

                if (ngModel) {
                    ngModel.$viewChangeListeners.unshift(function () {
                        var inputCharCode;
                        /**modify by weng 解决中间插入中文，英文字符无法消除的问题 2015-06-09 begin**/
                        pos = getCursorPosition(element);
                        inputCharCode = element.val().charCodeAt(pos - 1);
                        if ((inputCharCode > 65248 && inputCharCode < 65375) || inputCharCode === 12288) {
                            handlerValue();
                            setCaretPosition(element, pos);
                        }
                    });
                } else {
                    element.on('keyup.dbc', function (event) {
                        var inputCharCode;
                        /**modify by weng 解决中间插入中文，英文字符无法消除的问题 2015-06-09 begin**/
                        pos = getCursorPosition(element);
                        inputCharCode = element.val().charCodeAt(pos - 1);
                        if ((inputCharCode > 65248 && inputCharCode < 65375) || inputCharCode === 12288) {
                            handlerValue();
                            setCaretPosition(element, pos);
                        }
                        /**modify by weng 解决中间插入中文，英文字符无法消除的问题 2015-06-09 end**/
                    });
                }


                element.on('blur.dbc', function () {
                    handlerValue();
                    //$timeout.cancel(timer);
                });

                function handlerValue() {
                    var oldValue;
                    val = element.val();
                    oldValue = val;
                    /** modify by zhanghf 解决全选删除所有文本后，再输入时无法转换问题2015-10-25 **/
                    //if (length <= val.length) {
                    val = toCDB(val);
                    if (oldValue !== val) {
                        element.val(val);
                        if (ngModel && render === 'true') {
                            ngModel.$setViewValue(val);
                        }
                    }
                    //}
                    // length = val.length;
                    /*if (!scope.$$phase) {
                        scope.$digest();
                    }*/

                }
            }
        }
    }

});