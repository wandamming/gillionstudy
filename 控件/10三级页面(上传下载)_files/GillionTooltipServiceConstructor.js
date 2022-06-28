/**
 * Created by linxh on 2015/6/8.
 */
define('framework/tooltip/GillionTooltipServiceConstructor', [], function () {
    return function (GillionLocationService, ZIndex) {

        var TOOLTIP_DOM = "$TOOLTIP_DOM";

        /**
         * 通过对dom节点改变的方法
         * @param element {obj} 需要创建message的dom元素
         * @param params
         * @param params.message {string}
         * @param params.title {string} title属性 用于做提示内容
         * @param params.gTooltip {string} gTooltip属性 用于做提示内容 （优先于title）
         * @param params.direction {string} direction属性 显示方位 默认 （right）
         * @constructor
         */
        function Messages(element, params) {
            this.element = element;
            this.setParams(params);

        }

        Messages.prototype.setParams = function (params) {
            if (params) {
                this.title = params.title;
                this.gTooltip = params.gTooltip;
                this.direction = params.direction;
                this.fontColor = !!params.fontColor ? params.fontColor : '#737373';
                this.iconType = !!params.iconType ? params.iconType : 'fi-help';
                this.iconColor = !!params.iconColor ? params.iconColor : '#00b7ee';
                this.outterBox = !!params.outterBox ? params.outterBox : false;//外框样式
                this.className = params.className;
                this.tipBoxDefaultEvent = params.tipBoxDefaultEvent != undefined ? params.tipBoxDefaultEvent : true;
            }
        };
        /**
         * 获取消息内容 优先取gtooltip属性的值
         * @returns {*}
         */
        Messages.prototype.getMessage = function () {
            if (this.gTooltip) {
                return this.gTooltip;
            } else {
                return this.title;
            }
        };
        /**
         * 计算方向
         * @param me
         * @param next
         * @param body
         * @returns {*}
         */
        Messages.prototype.calculateDirection = function (me, next, body) {
            if (!body) {
                body = document.body;
            }
            if (next.offsetWidth + me.offsetWidth + me.offsetLeft + 30 < body.clientWidth) {
                return 'right';
            } else if (next.offsetHeight < me.offsetTop) {
                return 'top';
            } else if (next.offsetHeight + me.offsetHeight + me.offsetTop < body.clientHeight) {
                return 'bottom';
            } else {
                return 'right';
            }
        };
        /**
         * 显示信息
         */
        Messages.prototype.show = function () {
            if (!!this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = undefined;

            //this.relocate();
            if (this.element.data(TOOLTIP_DOM)) {
                this.element.data(TOOLTIP_DOM).css('display', 'block');
            }
        };
        /**
         * 隐藏信息
         */
        Messages.prototype.hide = function () {
            if (this.element.data(TOOLTIP_DOM)) {
                this.timeout = setTimeout(
                    function () {
                        this.element.data(TOOLTIP_DOM).css('display', 'none');
                    }, 300);
            }
        };
        /**
         * 设置方位
         * @param element
         */
        Messages.prototype.locate = function (element) {
            var me = element[0],
                index = 1,
                box = element.data(TOOLTIP_DOM),
                next,
                location, offset;
            if (!box) {
                return;
            }
            next = box[0];
            //this.direction = !!this.direction?this.direction:this.calculateDirection(me,next);
            while (!(me.offsetWidth > 0) && element[index]) {
                me = element[index];
                index++;
            }
            location = GillionLocationService.calculateLocation(me);
            offset = GillionLocationService.calculateDirection(me, next, null, "right", location);
            switch (this.direction || offset.direction) {
                case 'right':
                    if (this.outterBox) {
                        box.css("left", location.left + me.offsetWidth + 15);//me.offsetLeft + me.offsetWidth+15);
                    } else {
                        box.css("left", location.left + me.offsetWidth + 5);//me.offsetLeft + me.offsetWidth+5);
                    }
                    box.css("left", location.left + me.offsetWidth + 5);
                    box.addClass("right");
                    box.css("top", location.top);//me.offsetTop);
                    break;
                case 'top':
                    if (this.outterBox) {
                        box.css("top", location.top - me.offsetHeight - 15);//me.offsetTop-me.offsetHeight-15);
                    } else {
                        box.css("top", location.top - me.offsetHeight - 5);//me.offsetTop-me.offsetHeight-5);
                    }
                    box.addClass("tla");
                    box.css("left", location.left - (next.offsetWidth - me.offsetWidth));//me.offsetLeft-(next.offsetWidth-me.offsetWidth));
                    break;
                case 'left':
                    break;
                case 'bottom':
                    if (this.outterBox) {
                        box.css("top", location.top + me.offsetHeight + 10);//me.offsetTop+me.offsetHeight+10);
                    } else {
                        box.css("top", location.top + me.offsetHeight + 5);//me.offsetTop+me.offsetHeight+5);
                    }
                    box.addClass("bra");
                    box.css("left", location.left - (next.offsetWidth - me.offsetWidth));//me.offsetLeft-(next.offsetWidth-me.offsetWidth));
                    break;
                default:
                    break;
            }
        };
        /**
         * 创建提示框元素
         */
        Messages.prototype.createMessageDom = function () {

            this.timeout = undefined;
            var message = this.getMessage(),
                popover,
                that = this;

            var spanHtml = '<div class="popover" style="display: block;">' +
                '<div class="arrow"></div>' +
                '<div class="popover-content">' + message + '</div>' +
                '</div>';

            if (this.element.data(TOOLTIP_DOM)) {
                this.element.data(TOOLTIP_DOM).remove();
            }
            popover = GillionLocationService.createHtmltoTop(spanHtml);
            this.element.data(TOOLTIP_DOM, popover);
            var box = popover;
            var inext = box.find("i"),
                msgNext = box.find("div.popover-content")[0];
            if (!this.outterBox) {
                box.addClass("noborder");
            }
            //inext.addClass(this.iconType);
            this.className ? box.addClass(params.className) : '';
            //inext[0].style.color=this.iconColor;
            msgNext.style.color = this.fontColor;
            this.locate(this.element);
            if (this.tipBoxDefaultEvent) {
                box.on("mouseenter", function () {
                    that.show()
                });
                box.on("mouseleave", function () {
                    that.remove()
                });
            }
        };
        /**
         * 删除提示框
         */
        Messages.prototype.remove = function (delayTime) {
            var that = this;
            if (delayTime == undefined) {
                delayTime = 300;
            }
            if (that.element.data(TOOLTIP_DOM)) {
                this.timeout = setTimeout(function () {
                    if (that.element.data(TOOLTIP_DOM)) {
                        that.element.data(TOOLTIP_DOM).off();
                        that.element.data(TOOLTIP_DOM).remove();
                        that.element.removeData(TOOLTIP_DOM);
                    }
                }, delayTime);
            }
        };

        /**
         * 直接删除提示框
         */
        Messages.prototype.directRemove = function () {
            var that = this;
            if (that.element.data(TOOLTIP_DOM)) {
                if (that.element.data(TOOLTIP_DOM)) {
                    that.element.data(TOOLTIP_DOM).remove();
                    that.element.removeData(TOOLTIP_DOM);
                }
            }
        };

        return {
            create: function (element, params) {
                return new Messages(element, params);
            }
        };
    };
})
