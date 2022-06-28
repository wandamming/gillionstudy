define('framework/control/GillionNumericDirectiveConstructor', function () {
    function getCursorPosition(el) {
        var pos = 0, ele = el[0];
        if (ele.selectionStart !== undefined && ele.selectionStart !== 0) {
            pos = ele.selectionStart;
        } else if (document.selection) {
            ele.focus();
            var eleRange = document.selection.createRange();
            eleRange.moveStart('character', -ele.value.length);
            pos = eleRange.text.length;
        }
        return pos;
    }

    function setCaretPosition(ctrl0, pos) {//设置光标位置函数
        var ctrl = ctrl0[0];
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        } else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    /**
     * 处理全角负号
     * @return {[type]} [description]
     */
    function handleSBCNegative(pos, element) {
        var val = element.val();
        if (pos !== 1 || val.indexOf("-") > 0) {
            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
            element.val(val);
            setCaretPosition(element, pos - 1);
        }
    }

    /**
     * 处理半角负号
     * @return {[type]} [description]
     */
    function handleDBCNegative(pos, element) {
        var val = element.val();
        if (pos !== 1 || val.indexOf("-") !== val.lastIndexOf("-")) {
            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
            element.val(val);
            setCaretPosition(element, pos - 1);
        }

    }

    /**
     * 处理全角小数点输入
     * @return {[type]} [description]
     */
    function handleSBCRadixPoint(pos, element, allowFloat) {
        var val = element.val();
        if (allowFloat) {
            if (val.indexOf(".") >= 0) {
                val = val.substring(0, pos - 1) + val.substring(pos, val.length);
                element.val(val);
                setCaretPosition(element, pos - 1);
            }
        } else {
            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
            element.val(val);
            setCaretPosition(element, pos - 1);
        }
    }

    /**
     * 处理半角小数点输入
     * @return {[type]} [description]
     */
    function handleDBCRadixPoint(pos, element) {
        var val = element.val();
        if (pos !== val.indexOf(".") + 1 || val.indexOf(".") !== val.lastIndexOf(".")) {
            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
            element.val(val);
            setCaretPosition(element, pos - 1);
        }
    }

    /**
     * 判断是否是千分位格式
     * @param {*} value 
     */
    function isThousandFormat(value) {
        var reg = /^(-)?\d{1,3}(,\d{3})*(.\d+)?$/;
        return reg.test(value);
    }

    return function (Arrays) {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attributes, ngModel) {
                var allowFloat = attributes.gPrecision || attributes.allowFloat === 'true',
                    allowNegative = attributes.allowNegative === 'true',
                    emptyZero = attributes.emptyZero || 'false',
                    render = attributes.render || 'true',
                    integerPartLength = Number(attributes.integerpartLength),
                    maxLength = Number(attributes.maxLength);
                integerPartLength = isNaN(integerPartLength) ? 0 : integerPartLength;
                maxLength = isNaN(maxLength) ? 0 : maxLength;
                if (element.is(':text,input[type=number]')) {
                    element.on('keydown', function (event) {
                        var which = event.which || event.keyCode, val;
                        // 字母并未按下功能键
                        if (which >= 65 && which <= 90 && !event.ctrlKey && !event.metaKey) {
                            event.preventDefault();
                        }
                        // 数字并按下了shift键
                        if (which >= 48 && which <= 57 && event.shiftKey) {
                            event.preventDefault();
                        }
                        // 其他字符输入 和 32-空格
                        if (Arrays.exists([106, 107, 111, 186, 187, 188, 191, 192, 219, 220, 221, 222, 32], which)) {
                            event.preventDefault();
                        }
                        // 允许浮点数， 即允许输入小数点
                        if (!allowFloat && (which === 110 || which === 190)) {
                            event.preventDefault();
                        }
                        // 允许负数，即允许输入负号
                        //modified by zhanghf  中文输入法中229也是负号
                        //modified by zhanghf  极品五笔下的所有输入都是which 229
                        //modified by huangyc  搜狗五笔输入法173也是负号
                        if (allowNegative === false && (which === 189 || which === 109 || which === 173)) {
                            event.preventDefault();
                        }
                    });

                    /**add by wengms V1.00.00 2015-06-15 在全角字符输入情况下，增加对输入的处理 begin**/
                    element.on('keyup', function (event) {
                        var val = element.val(),
                            pos = getCursorPosition(element),
                            charCode = val.charCodeAt(pos - 1),
                            which = event.which || event.keyCode;
                        if(isNaN(val) && !((charCode >= 65296 && charCode <= 65305) || (charCode === 65293 && allowNegative) || charCode === 65294)) val = "";
                        //搜狗拼音输入法无法使用event.preventDefault()方法问题
                        if ((charCode >= 48 && charCode <= 57) || (charCode === 45 && allowNegative) || charCode === 46) {
                            //处理负号
                            if (charCode === 45) {
                                //此处直接传入pos是为了防止对element的多次查找
                                handleDBCNegative(pos, element);
                            }
                            //处理小数点,以第一个小数点为准，若输入的小数点不是第一个小数点，则删除此小数点
                            if (charCode === 46 && allowFloat) {
                                handleDBCRadixPoint(pos, element);
                            }
                        } else {
                            if ((charCode >= 65296 && charCode <= 65305) || (charCode === 65293 && allowNegative) || charCode === 65294) {
                                //处理负号
                                if (charCode === 65293) {
                                    handleSBCNegative(pos, element);
                                }
                                //处理小数点,以第一个小数点为准，若输入的小数点不是第一个小数点，则删除此小数点
                                if (charCode === 65294) {
                                    handleSBCRadixPoint(pos, element, allowFloat);
                                }
                            } else {
                                //删除非法字符
                                val = val.substring(0, pos - 1) + val.substring(pos, val.length);
                                element.val(val);
                                setCaretPosition(element, pos - 1);
                            }
                        }
                        //自动补小数点
                        val = element.val();
                        if (integerPartLength > 0 && val.length >= integerPartLength) {
                            if (val.indexOf(".") === -1 && val.indexOf("．") === -1) {
                                if (which !== 8 && allowFloat) {
                                    if (maxLength === 0 || maxLength > integerPartLength) {
                                        if (val.length == integerPartLength) {
                                            val = val + ".";
                                        } else {
                                            val = val.substr(0, integerPartLength) + "." + val.substr(integerPartLength);
                                        }
                                        element.val(val);
                                    }
                                }
                            }
                        }
                        //增加对整数长度
                        val = element.val();
                        if (val.length > maxLength && maxLength > 0) {
                            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
                            element.val(val);
                            setCaretPosition(element, pos - 1);

                            if (val.length > maxLength) {
                                val = val.substr(0, maxLength);
                                element.val(val);
                            }
                        }
                        //最大长度处理
                        if ((val.indexOf(".") !== -1 && val.length > 16) || (val.indexOf(".") === -1 && val.length > 15)) {
                            val = val.substring(0, pos - 1) + val.substring(pos, val.length);
                            element.val(val);
                            setCaretPosition(element, pos - 1);
                        }
                        if (ngModel) {
                            ngModel.$setViewValue(val);
                        }
                        if (!scope.$$phase) {
                            scope.$digest();
                        }
                    });
                    //添加对tab按键的处理，高亮显示全选
                    element.on('keyup', function (event) {
                        if ((event.which || event.keyCode) == 9) {
                            element.select();
                        }
                    });

                    /**add by wengms V1.00.00 2015-06-15 在全角字符输入情况下，增加对输入的处理 end**/
                    element.on('blur', function () {
                        var result, str = element.val();
                        var tmp = "", index,
                            length = str.length,
                            i, precision, integer;
                        for (i = 0; i < length; i++) {
                            if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
                                tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
                            } else {
                                tmp += String.fromCharCode(str.charCodeAt(i));
                            }
                        }
                        //maxlength属性处理
                        if ((tmp.length > maxLength && maxLength !== 0)) {
                            tmp = tmp.substring(0, maxLength);
                        }
                        if (isNaN(tmp) && !isThousandFormat(tmp)) {
                            if (emptyZero === 'true') {
                                tmp = "0";
                            } else {
                                tmp = '';
                            }
                        }
                        if (allowFloat) {
                            //最大长度
                            index = tmp.indexOf(".");
                            if (index === -1 && tmp.length > 15) {
                                tmp = tmp.substring(0, 15);
                            } else if (index !== -1 && tmp.length > 16) {
                                tmp = tmp.substring(0, 16);
                            }
                            /**modify by wengms 2015-06-09 修复浮点型小数点后数字都为0情况下，转数字0会消息的bug begin**/
                            //处理小数号自动输入
                            if (integerPartLength > 0 && tmp.length > integerPartLength && tmp.indexOf(".") == -1) {
                                if (maxLength !== 0) {
                                    if (maxLength > tmp.length) {
                                        tmp = tmp.substr(0, integerPartLength) + "." + tmp.substr(integerPartLength);
                                    }
                                } else {
                                    tmp = tmp.substr(0, integerPartLength) + "." + tmp.substr(integerPartLength);
                                }
                            }
                            precision = tmp.split(".")[1] || '';
                            //整数只含0的情况
                            integer = tmp.split(".")[0] || '';
                            if (integer.match(/^0+$/)) {
                                if (precision.length > 0) {
                                    tmp = "0." + precision;
                                } else {
                                    tmp = "0";
                                }
                            }
                            //小数只含0的情况
                            if (precision && precision.length > 0) {
                                result = tmp;
                            } else {
                                result = parseFloat(tmp, 10);
                            }
                            /**modify by wengms end**/
                        } else {
                            //最大长度
                            if (tmp.length > 15) {
                                tmp = tmp.substring(0, 15);
                            }
                            /**modify by wengms 指定十进制，防止IE下的bug V1.00.01 begin**/
                            result = parseInt(tmp, 10);
                            /**modify by wengms 指定十进制，防止IE下的bug V1.00.01 end**/
                        }

                        if (isNaN(result) && !isThousandFormat(result)) result = "";
                        if (!allowNegative) {
                            result = result.toString().replace(/-/g, "");
                        }
                        if (str === "" && emptyZero === "true") {
                            result = "0";
                        }
                        if (str !== result) {
                            if (!isNaN(result)) {
                                element.val(result);
                                if (ngModel && render === 'true') {
                                    ngModel.$setViewValue(result);
                                }
                            } else if (emptyZero === 'false') {
                                element.val('');
                            }
                            /*if (!scope.$$phase) {
                                scope.$digest();
                            }*/
                        } else if (str === result && ngModel && result != ngModel.$viewValue) {
                            if (render === 'true') {
                                if (isThousandFormat(result) && !isNaN(result.replace(/,/g,""))) {
                                    result = result.replace(/,/g,"");
                                }
                                ngModel.$setViewValue(result);
                                /*if (!scope.$$phase) {
                                    scope.$digest();
                                }*/
                            }
                        }
                        this.selectFlag = false;
                    });
                    //点击事件选中数字
                    element.on('click', function () {
                        if (this.selectFlag) {
                            element.focus();
                        } else {
                            element.select();
                            this.selectFlag = true;
                        }                        
                    });
                }
            }
        };
    };
});