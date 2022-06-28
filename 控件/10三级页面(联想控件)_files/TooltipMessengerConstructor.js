/**
 * Created by linxh on 2015/9/9.
 */
define("framework/validation/TooltipMessengerConstructor", [
    'framework/validation/AbstractIllegalMessenger'
], function (AbstractIllegalMessenger) {
    return function (GillionTooltipService) {
        var ILLEGAL_MSG_KEY = '$illegal-msg',
            TOOLTIP_DOM = "$TOOLTIP_DOM",
            TOOLTIP_SCOPE = "TOOLTIP_VALIDATE_SCOPE",
            OUTPUT_MSG = "$OUTPUT_MSG";

        function TooltipMessenger() {
        }

        TooltipMessenger.prototype = AbstractIllegalMessenger.prototype;


        TooltipMessenger.prototype.handle = function (msgParams) {

            var $target = msgParams.$verifyTarget,
                $outerContainer = msgParams.$outerContainer,
                ruleName = msgParams.ruleName,
                message = msgParams.message,
                illegalMessage = $target.data(ILLEGAL_MSG_KEY) || {},
                isDropDown = $outerContainer.is('.form-dropdown, .form-dorpdown'),
                isEventBind,
                outputMsg, messages,
                $focus, tooltip,
                msgKey, params, checkTimer;
            $focus = this.getFocusElement($outerContainer, $target);
            if (!$focus) return;
            if (msgParams.isValid) {
                if (illegalMessage.hasOwnProperty(ruleName))
                    delete illegalMessage[ruleName];
            } else {
                illegalMessage[ruleName] = message;
            }
            for (msgKey in illegalMessage) {
                outputMsg = illegalMessage[msgKey];
                break;
            }
            if (!!outputMsg) {
                var $outputMsg = $outerContainer.data(OUTPUT_MSG);
                params = this.InitParam(outputMsg, "warn");
                messages = GillionTooltipService.create($outerContainer, params);
                if (outputMsg != $outputMsg || !$outerContainer.data(TOOLTIP_DOM)) {
                    messages.createMessageDom();
                    $outerContainer.data(OUTPUT_MSG, outputMsg);
                    $outerContainer.addClass("high-light-border");
                    tooltip = $outerContainer.data(TOOLTIP_DOM);
                    tooltip.css("display", "none");
                    $focus.off("focus." + TOOLTIP_SCOPE);
                    $focus.off("blur." + TOOLTIP_SCOPE);
                    $outerContainer.off("mouseenter." + TOOLTIP_SCOPE);
                    $outerContainer.off("mouseleave." + TOOLTIP_SCOPE);
                    $focus.on("focus." + TOOLTIP_SCOPE, function () {
                        if ($outerContainer.data(TOOLTIP_DOM)) {
                            tooltip.css("display", "none");
                            /*if (isDropDown) {
                                if (!checkTimer) {
                                    checkTimer = setInterval(function() {
                                        if (checkIsShowMenu()) {
                                            tooltip.css("display", "none");
                                        } else {
                                            tooltip.css("display", "block");
                                            messages.locate(messages.element);
                                        }
                                    }, 500);
                                }
                                return;
                            }
                            tooltip.css("display","block");
                            messages.locate(messages.element);*/
                        }
                    });
                    $focus.on("blur." + TOOLTIP_SCOPE, function () {
                        tooltip.css("display", "none");
                        clearInterval(checkTimer);
                        checkTimer = void 0;
                    });
                    //表格滚动时隐藏，临时方案，有好的再替换
                    $focus.parents(".grid").on("scroll.tooltipmessager", function () {
                        tooltip.css("display", "none");
                    });
                    $outerContainer.on("mouseenter." + TOOLTIP_SCOPE, function () {
                        if ($outerContainer.data(TOOLTIP_DOM)) {
                            if (isDropDown && checkIsShowMenu()) {
                                return;
                            }
                            var activeElement = null;
                            if ($outerContainer.is("input")) {
                                activeElement = $outerContainer[0];
                            } else {
                                var $activeElement = $outerContainer.find("input");
                                if ($activeElement.length > 0) activeElement = $activeElement[0];
                            }
                            if (activeElement !== document.activeElement) {
                                tooltip.css("display", "block");
                                messages.locate(messages.element);
                            }
                        }
                    });
                    $outerContainer.on("mouseleave." + TOOLTIP_SCOPE, function () {
                        if (document.activeElement != $focus[0] || (isDropDown && checkIsShowMenu())) {
                            tooltip.css("display", "none");
                        }
                    });
                    $outerContainer.find("input").on("focus.tooltip", function () {
                        tooltip.css("display", "none");
                    });
                }
                if (this.validaForm) {
                    //$focus[0].focus();
                    this.validaForm = false;
                } else if (document.activeElement == $focus[0]) {
                    if ($outerContainer.data(TOOLTIP_DOM)) {
                        tooltip = $outerContainer.data(TOOLTIP_DOM);
                        if (isDropDown && checkIsShowMenu()) {
                            tooltip.css("display", "none");

                        } else {
                            tooltip.css("display", "block");
                            messages.locate(messages.element);
                        }
                    }
                }

            } else {
                if ($outerContainer.data(TOOLTIP_DOM)) {
                    $outerContainer.data(TOOLTIP_DOM).remove();
                    $outerContainer.removeData(TOOLTIP_DOM);
                }
                $outerContainer.removeClass("high-light-border");
            }
            $target.data(ILLEGAL_MSG_KEY, illegalMessage);

            function checkIsShowMenu() {
                return $outerContainer.is('.is-show-menu');
            }
        };

        TooltipMessenger.prototype.clear = function ($target) {
            var params = {};
            $target.removeData(ILLEGAL_MSG_KEY);
            $target.removeClass("high-light-border");
            GillionTooltipService.create($target, params).directRemove();
        };

        TooltipMessenger.prototype.startValidForm = function () {
            this.validaForm = true;
        };

        TooltipMessenger.prototype.getFocusElement = function ($outerContainer, $target) {
            var $focus;
            if (!$target.length) return;
            if ($target[0].tagName == "INPUT" || $target[0].tagName == 'A') {
                $focus = $target;
            } else {
                $focus = $outerContainer.find("a");
            }
            if ($focus.length == 0) {
                $focus = $outerContainer;
            }
            return $focus;
        }

        TooltipMessenger.prototype.InitParam = function (message, messageType) {
            var params = {
                'gTooltip': message,
                'outterBox': true,
                'tipBoxDefaultEvent': false
            };
            if (messageType == 'tip') {
                params.fontColor = "#00b7ee";
                params.iconColor = "#00b7ee";
                params.iconType = 'fi-help';
            } else if (messageType == 'warn') {
                params.fontColor = "#E0600B";
                params.iconColor = "#f06e00";
                params.iconType = 'fi-error';
            }
            return params;
        };

        return new TooltipMessenger();
    };
});
