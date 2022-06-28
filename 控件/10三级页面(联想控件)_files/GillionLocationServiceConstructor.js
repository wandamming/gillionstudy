/**
 * Created by linxh on 2015/9/24.
 */
define("framework/snapshot/GillionLocationServiceConstructor", ['angular'], function (angular) {


    return function (ZIndex) {

        function Location() {

        }

        Location.prototype.createHtmltoTop = function (outHtml, thisWindow) {
            if (!thisWindow) {
                thisWindow = window;
            }
            var me = this,
                topWindow = me.getTopWindow(thisWindow),
                mainJq = me.getTopJq(),
                outJqlite = mainJq(outHtml),
                zIndex = ZIndex.getMaxZIndex();
            outJqlite.css("z-index", zIndex);
            var hideOutJqlite = function () {
                outJqlite.css('display', 'none');
            };
            var hideOutJqliteOutside = function (event) {
                if (outJqlite.css('display') === 'none' || angular.element(event.target).closest(outJqlite[0]).length) {
                    return;
                }
                hideOutJqlite();
            };
            var $tabBody = mainJq(topWindow.document).find('div.tab-body');
            angular.element(thisWindow).on("unload, destroy", function () {
                angular.element(thisWindow).off();
                mainJq(topWindow).off("scroll", hideOutJqlite);
                $tabBody.off('scroll', hideOutJqlite);
                angular.element(thisWindow).off("wheel mousedown", hideOutJqliteOutside);
                outJqlite.remove();
            });
            angular.element(thisWindow).on("scroll", hideOutJqlite);
            angular.element(thisWindow).on("wheel mousedown", hideOutJqliteOutside);

            if (topWindow != thisWindow) {
                mainJq(topWindow).on("scroll", hideOutJqlite);
                $tabBody.on('scroll', hideOutJqlite);
            }

            topWindow.document.body.appendChild(outJqlite[0]);
            thisWindow = null;
            return outJqlite;
        };

        Location.prototype.offScrollEvent = function () {

        }

        /**
         * 往某个窗口添加文件
         * @param myWindow 窗口dom
         * @param filePath 文件路径
         */
        Location.prototype.addCssFile = function (myWindow, filePath) {
            var head = myWindow.document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = filePath;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            head.appendChild(link);
        };

        /**
         * @param element 对应元素
         * @param thisWindow 窗口dom
         * @param topWindow 窗口dom
         */
        Location.prototype.calculateLocation = function (element, thisWindow, topWindow) {
            if (!thisWindow) {
                thisWindow = window;
            }

            if (!topWindow) {
                topWindow = this.getTopWindow(thisWindow);
            }
            element = angular.element(element);
            element = element[0];

            function getScrollTop(win) {
                return win.document.documentElement.scrollTop || win.pageYOffset || win.document.body.scrollTop;
            }

            function getScrollLeft(win) {
                return win.document.documentElement.scrollLeft || win.pageXOffset || win.document.body.scrollLeft;
            }
            var currentWindow,
                scrollLeft = getScrollLeft(thisWindow),//.document.body.scrollLeft,
                scrollTop = getScrollTop(thisWindow),//.document.body.scrollTop,
                cumulativeScrollLeft = 0,
                cumulativeScrollTop = 0,
                position = {
                    "left": this.getRealOffsetLeft(element)  - scrollLeft - this.getScrollLeft(element),
                    "top": this.getRealOffsetTop(element)  - scrollTop - this.getScrollTop(element)
                };

            /*if(thisWindow == topWindow){
                position.top -= scrollTop;
                position.left -= scrollLeft;
            }*/
            for (currentWindow = thisWindow; currentWindow != topWindow; currentWindow = currentWindow.parent) {
                var parentIframe = this.getParentIframe(currentWindow);
                position.left += this.getRealOffsetLeft(parentIframe) - getScrollLeft(currentWindow) - this.getScrollLeft(parentIframe);
                position.top += this.getRealOffsetTop(parentIframe) - getScrollTop(currentWindow) - this.getScrollTop(parentIframe);
                //因为弹出框position是fix属性 导致getRealOffsetLeft是获取无关滚动条的长度
                if (currentWindow.name.indexOf("msgBox") != -1) {
                    var sl = getScrollLeft(currentWindow.parent);// currentWindow.parent.document.body.scrollLeft;
                    var st = getScrollTop(currentWindow.parent);// currentWindow.parent.document.body.scrollTop;
                    position.left += sl;
                    position.top += st;
                    cumulativeScrollLeft += sl;
                    cumulativeScrollTop += st;
                }

                //scrollLeft = getScrollLeft(currentWindow);//.document.body.scrollLeft;
                //scrollTop = getScrollTop(currentWindow);//.document.body.scrollTop;
            }
            var docElement = topWindow.document.documentElement,
                docWidth = docElement.clientWidth + cumulativeScrollLeft,
                docHeight = docElement.clientHeight + cumulativeScrollTop;

            position.right = docWidth - position.left;
            position.bottom = docHeight - position.top;
            return position;
        };

        /**
         * @param
         *
         */
        Location.prototype.calculateDirection = function (target, next, winBody, directionFirst, position) {
            if (!winBody) {
                winBody = this.getTopWindow(window).document.body;
            }
            //方向优先 默认底部优先
            var offsetLeft = 0;
            this.getRealOffsetLeft(target);
            var offsetTop = 0;
            this.getRealOffsetTop(target);
            if (position) {
                offsetLeft = position.left;
                offsetTop = position.top;
            } else {
                offsetLeft = this.getRealOffsetLeft(target);
                offsetTop = this.getRealOffsetTop(target);
            }
            if (directionFirst == "right") {
                if (next.offsetWidth + target.offsetWidth + offsetLeft + 30 < winBody.clientWidth) {
                    return {left: target.offsetWidth, top: 0, direction: "right"};
                }
            }
            if (next.offsetHeight + target.offsetHeight + offsetTop < winBody.clientHeight) {
                return {left: 0, top: target.offsetHeight, direction: "bottom"};
            } else if (next.offsetHeight < offsetTop) {
                return {left: 0, top: -(next.offsetHeight), direction: "top"};
            } else if (next.offsetWidth + target.offsetWidth + offsetLeft + 30 < winBody.clientWidth) {
                return {left: target.offsetWidth, top: 0, direction: "right"};
            } else {
                return {left: 0, top: target.offsetHeight, direction: "bottom"};
            }
        };

        /**
         *
         * @param obj dom对象
         */
        Location.prototype.getRealOffsetLeft = function (obj) {
            var left = obj.offsetLeft;
            while (obj = obj.offsetParent) {
                left += obj.offsetLeft; //叠加父容器的左边距
            }
            return left;
        };

        /**
         *
         * @param obj dom对象
         */
        Location.prototype.getScrollTop = function (obj) {
            var scrollTop = 0;
            obj = obj.parentNode;
            while (obj && obj.tagName != 'BODY') {
                scrollTop += obj.scrollTop; //叠加父容器的上滚动边距
                obj = obj.parentNode;
            }
            return scrollTop;
        };

        /**
         *
         * @param obj dom对象
         */
        Location.prototype.getScrollLeft = function (obj) {
            var scrollLeft = 0;
            obj = obj.parentNode;
            while (obj && obj.tagName != 'BODY') {
                scrollLeft += obj.scrollLeft; //叠加父容器的左边距
                obj = obj.parentNode;
            }
            return scrollLeft;
        };

        /**
         *
         * @param obj dom对象
         */
        Location.prototype.getRealOffsetTop = function (obj) {
            var top = obj.offsetTop;
            while (obj = obj.offsetParent) {
                top += obj.offsetTop; //叠加父容器的左边距
            }
            return top;
        };

        Location.prototype.getParentIframe = function (thisWindow) {
            var a = thisWindow.parent.document.getElementsByTagName("iframe");
            for (var i = 0; i < a.length; i++) {
                if (a[i].contentWindow == thisWindow) {
                    return a[i];
                }
            }
            return null;
        };

        /**
         * 获取框架的top
         * @param win
         * @returns {*}
         */
        Location.prototype.getTopWindow = function (win) {
            win = win || window;
            var href = win.location.href,
                mainWin = win || window;
            if (href.indexOf('__showUrl=true') > -1) {
                mainWin = this.getTopWindow(mainWin.parent);
            }
            return mainWin;
        };

        Location.prototype.getRealTopWindow = function (win) {
            var mainWin = win || window;
            while (mainWin !== mainWin.parent) {
                mainWin = mainWin.parent;
            }
            return mainWin;
        };

        Location.prototype.getTopJq = function () {
            return this.getRealTopWindow().$ || this.getTopWindow().$;
        };

        Location.prototype.getTopCompile = function () {
            var topWindow = this.getRealTopWindow();
            var topJq, topCompile;
            if (!topWindow.angular) {
                topWindow = this.getTopWindow();
            }
            topJq = topWindow.angular.element;
            topCompile = topJq(topWindow.document).injector().get('$compile');
            return topCompile;
        };

        return new Location();
    };
});
