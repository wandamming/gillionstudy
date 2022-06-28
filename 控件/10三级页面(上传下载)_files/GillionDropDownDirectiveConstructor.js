// g3
define('framework/dropdown/GillionDropDownDirectiveConstructor', ['angular', 'underscore', 'config.properties'], function (angular, _, config) {
    return function ($parse, $timeout, $document, $compile, $tabindex, GillionLocationService, GillionMsgService) {
        var RadioDropdown, CheckBoxDropdown, DropdownFactory;
        var extend = function (child, parent) {
                for (var key in parent) {
                    if (hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }

                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            },
            hasProp = {}.hasOwnProperty;
        var DROPITEMOBJ = 'DROP_ITEM_OBJ';

        //全角换半角
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
            tmp = tmp.replace("　", " ");
            return tmp
        }

        //去左空格
        function trimLeft(text) {
            return text.replace(/^\s*/g, "");
        }

        function joinCodeAndName(source, splitValue, displayExpress, valueExpress) {
            var resultData = [];
            displayExpress = displayExpress || 'key';
            valueExpress = valueExpress || 'value';
            if (_(splitValue).isEmpty() || _(source).isEmpty()) return source;
            return _(source).map(function (item) {
                var ele = angular.copy(item);
                ele[displayExpress] = ele[valueExpress] + splitValue + ele[displayExpress];
                return ele;
            });
        }

        function BaseDropdown($scope, $attrs, $controller, $timeout, itemList) {
            this.$scope = $scope;
            this.$attrs = $attrs;
            this.$controller = $controller;
            this.$timeout = $timeout;
            this.itemList = !!itemList ? itemList : [];
            this.valueSeparator = $scope.valueSeparator || ',';
        };

        BaseDropdown.prototype.transObjToArr = function (obj) {
            var result = [];
            for (var prop in obj) {
                var item = {};
                item.key = prop;
                item.value = obj[prop];
                result.push(item);
            }
            return result;
        };

        BaseDropdown.prototype.apply = function (obj) {
            var scope = this.$scope;
            if (!scope.$root.$$phase) {
                scope.$apply();
            }
        };

        BaseDropdown.prototype.addDefaultOption = function () {
            var initSource = [],
                scope = this.$scope;
            initSource.push(scope.defaultOption);
            if (scope.source) {
                angular.forEach(scope.source, function (item) {
                    //如果引用不变 子指令不会重新解析
                    initSource.push(angular.extend({}, item));
                })
            }
            scope.$source = initSource;
            if (!_(scope.displayCode).isEmpty()) {
                scope.$source = joinCodeAndName(scope.$source, scope.displayCode, scope.displayExpress, scope.valueProp);
            }
            scope.sourceTemp = angular.copy(scope.$source);
            if (!scope.ngModelInit) {
                scope.setModelValue(scope.valueGetter(scope.defaultOption));
                scope.display = scope.displayGetter(scope.defaultOption);
            }
        };
        /**
         * 初始化子选项列表
         */
        BaseDropdown.prototype.initItemList = function () {
            var scope = this.$scope,
                me = this,
                ulElement = scope.ulElement,
                topJq = GillionLocationService.getTopJq(),
                liJqObj, dropItem;
            if (scope.timer2) {
                $timeout.cancel(scope.timer2);
            }
            scope.timer2 = $timeout(function () {
                me.itemList = [];
                //设置样式（单选多选）
                angular.forEach(ulElement.find("li[ng-show!='addShow']"), function (litem) {
                    liJqObj = topJq(litem);
                    if (!liJqObj.hasClass("checkbox-all")) {
                        dropItem = liJqObj.data(DROPITEMOBJ);
                        me.itemList.push(dropItem);
                    }
                });
                me.showSelect(scope.getModelValue());
            }, 100);
        };

        BaseDropdown.prototype.onBeforeSelect = function (item) {
            var self = this;
            if (angular.isDefined(self.$attrs.onBeforeSelect)) {
                if (self.$scope.onBeforeSelect({
                    list: self,
                    item: item
                }) === false) {
                    return false;
                }
            }
        };

        BaseDropdown.prototype.onSelect = function (item) {
            var self = this;
            $timeout(function(){
                self.$scope.isShow=false;
            })

            if (angular.isDefined(self.$attrs.onSelect)) {
                self.$scope.onSelect({
                    list: self,
                    item: item
                });
            }
        };

        BaseDropdown.prototype.selectItem = function (item) {
            var self = this;
            if (self.onBeforeSelect(item) === false) {
                return;
            }
            self.$scope.$selectedRow = item.itemObj;
            self.$scope.setModelValue(item.attrs.value);
            //设置index
            _(self.itemList).each(function (item) {
                item.removeSelectStyle();
            });
            item.addSelectStyle();
            self.$scope.keyIndex = _(self.itemList).findIndex(item);
            self.$scope.display = item.attrs.text;
            self.$scope.isShow = false;
            self.$scope.needFocus = true;
            self.$scope.inputText[0].focus();
            self.apply();

            self.onSelect(item);
        };
        //显示选择 用于显示
        BaseDropdown.prototype.showSelect = function (value) {
            var me = this,
                scope = me.$scope,
                text = '';
            if (value != undefined) {
                var display = _.chain(me.itemList).filter(function (item, index) {
                    try {
                        if (item.attrs.value == value) {
                            scope.keyIndex = index;
                            return true;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                }).map(function (item) {
                    scope.$selectedRow = item.itemObj;
                    return item.attrs.text;
                }).value();
                //me.$scope.display = display.join(me.valueSeparator);
                if (scope.filter && scope.isShow) {
                    scope.display = scope.handInputValue;
                } else {
                    text = display.join(me.valueSeparator);
                    if (text || scope.unmatchRemove) {
                        scope.display = text;
                    } else {
                        if (!scope.unmatchHide) {
                            scope.display = value;
                        }
                    }
                }
            } else {
                scope.display = '';
            }
        };

        BaseDropdown.prototype.filterSource = function (text) {
            var me = this,
                scope = me.$scope,
                sourceTemp,
                displayTemp;
            sourceTemp = _.chain(scope.sourceTemp).filter(
                function (item) {
                    displayTemp = scope.displayGetter(item);
                    if (displayTemp && displayTemp.indexOf(text) != -1) {
                        return true;
                    }
                }).value();
            scope.$source = sourceTemp;
        };


        BaseDropdown.prototype.valueMatch = function (text) {
            var me = this,
                i, ele, itemValue,
                resultItems = {};
            if (_(text).isEmpty()) return resultItems;
            text = text.toUpperCase();
            //再全匹配
            _(me.itemList).each(function (item) {
                itemValue = (item.attrs.text || '').toUpperCase();
                if (itemValue === text) {
                    resultItems = item;
                }
            });
            //没找到再使用模糊匹配
            if (_(resultItems).isEmpty()) {
                for (i = 0; i < me.itemList.length; i++) {
                    ele = me.itemList[i];
                    itemValue = (ele.attrs.text || '').toUpperCase();
                    if (itemValue.indexOf(text) === 0) {
                        resultItems = ele;
                        break;
                    }
                }
            }
            return resultItems;
        };

        BaseDropdown.prototype.scrollCurrent = function () {
            var me = this,
                element = me.$scope.ulElement,
                itemHeight = me.itemList.length > 0 ? me.itemList[0].element.outerHeight() : 0,
                contentHeight = itemHeight * me.itemList.length,
                containerHeight = element.height();

            if (containerHeight >= contentHeight)return;
            element.scrollTop(0);
            var position = element.find(".current").position();
            if (!position) return;
            if (position.top > containerHeight) {
                element.scrollTop(position.top - containerHeight + itemHeight);
            } else {
                element.scrollTop(0);
            }
        };

        BaseDropdown.prototype.refreshSelect = function (newValue, needSelect) {
            var me = this,
                scope = me.$scope,
                display,
                selectedItem = {},
                text = '';
            needSelect = needSelect !== false;
            //去左空格
            newValue = trimLeft(newValue);
            //做全角转换
            if (scope.gDbc) {
                newValue = toCDB(newValue);
            }
            scope.handInputValue = newValue;
            scope.display = newValue;
            if (scope.filter) {
                me.filterSource(newValue);
            }
            if (!_(newValue).isEmpty()) {
                if (scope.associateType === "selectFirst") {
                    selectedItem = me.valueMatch(newValue);
                    //清空当前行
                    _(me.itemList).each(function (item) {
                        item.removeSelectStyle();
                    });
                    if (!_(selectedItem).isEmpty()) {
                        selectedItem.addSelectStyle();
                        scope.keyIndex = _(me.itemList).findIndex(selectedItem);
                        scope.$selectedRow = selectedItem.itemObj;
                        text = selectedItem.attrs.value;
                        setTimeout(function () {
                            me.scrollCurrent();
                        });
                    } else {
                        scope.keyIndex = -1;
                    }
                } else {
                    display = _(me.itemList).chain().filter(function (item) {
                        return item.attrs.text === newValue;
                    }).map(function (item) {
                        scope.$selectedRow = item.itemObj;
                        return item.attrs.value;
                    }).value();
                    text = display[0];
                }

                if (text || scope.unmatchRemove) {
                    scope.setModelValue(text);
                } else {
                    if (me.$attrs.defaultOption && newValue == scope.displayGetter(scope.defaultOption)) {
                        scope.setModelValue(scope.valueGetter(scope.defaultOption));
                    } else {
                        scope.setModelValue(newValue);
                    }
                }
            } else {
                if (scope.associateType === "selectFirst") {
                    scope.keyIndex = -1;
                    //清空当前行
                    _(me.itemList).each(function (item) {
                        item.removeSelectStyle();
                    });
                }
                scope.setModelValue('');
            }
        };

        BaseDropdown.prototype.displayInit = function (display, value) {
            var myScope = this.scope,
                selectedRow = {};
            if (myScope.$selectedRow && myScope.$selectedRow != {}) {
                selectedRow = myScope.$selectedRow;
            }
            selectedRow[myScope.displayExpress] = display;
            selectedRow[myScope.valueProp] = value;
            myScope.$selectedRow = selectedRow;
        };

        RadioDropdown = (function (superClass) {
            extend(RadioDropdown, superClass);

            function RadioDropdown($scope, $attrs, $controller, $timeout, itemList) {
                this.$scope = $scope;
                this.$attrs = $attrs;
                this.$controller = $controller;
                this.$timeout = $timeout;
                this.itemList = !!itemList ? itemList : [];
                RadioDropdown.__super__.constructor.call(this, this.$scope, this.$attrs, this.$controller, this.$timeout, this.itemList);
            }

            RadioDropdown.prototype.selectItem = function (item) {
                var self = this;
                if (self.onBeforeSelect(item) === false) {
                    return;
                }

                var selected = item.getSelect(),
                    me = this,
                    myScope = me.$scope;

                for (var i = 0; i < this.itemList.length; i++) {
                    var each = this.itemList[i];
                    each.unSelect();
                }
                if (selected) {
                    myScope.setModelValue('');
                    myScope.display = '';
                    myScope.$selectedRow = {};
                } else {
                    item.select();
                    myScope.setModelValue(item.attrs.value);
                    myScope.display = item.attrs.text;
                    myScope.$selectedRow = item.itemObj;

                }
                myScope.isShow = false;
                myScope.needFocus = true;
                myScope.inputText[0].focus();

                self.onSelect(item);
                me.apply();
            };

            RadioDropdown.prototype.refreshSelect = function (newValue, needSelect) {
                var me = this,
                    scope = me.$scope,
                    display,
                    selectedItem,
                    text = '';
                needSelect = needSelect !== false;
                newValue = trimLeft(newValue);
                //做全角转换
                if (scope.gDbc) {
                    newValue = toCDB(newValue);
                }
                scope.handInputValue = newValue;
                if (scope.filter) {
                    me.filterSource(newValue);
                }
                if (!_(newValue).isEmpty()) {
                    if (scope.associateType === "selectFirst") {
                        selectedItem = me.valueMatch(newValue);
                        //清空当前行
                        _(me.itemList).each(function (item) {
                            item.unSelect();
                            item.removeSelectStyle();
                        });
                        if (!_(selectedItem).isEmpty()) {
                            selectedItem.addSelectStyle();
                            scope.keyIndex = _(me.itemList).findIndex(selectedItem);
                            if (needSelect) {
                                selectedItem.select();
                            }
                            scope.$selectedRow = selectedItem.itemObj;
                            text = selectedItem.attrs.value;
                        } else {
                            scope.keyIndex = -1;
                        }
                    } else {
                        display = _.chain(me.itemList).filter(function (item) {
                            item.unSelect();
                            return item.attrs.text == newValue;
                        }).map(function (item) {
                            scope.$selectedRow = item.itemObj;
                            return item.attrs.value;
                        }).value();
                        text = display[0];
                    }
                    if (text || scope.unmatchRemove) {
                        scope.setModelValue(text);
                    } else {
                        scope.setModelValue(newValue);
                    }
                } else {
                    if (scope.associateType === "selectFirst") {
                        scope.keyIndex = -1;
                        //清空当前行
                        _(me.itemList).each(function (item) {
                            item.unSelect();
                            item.removeSelectStyle();
                        });
                    }
                    scope.setModelValue('');
                }
            };

            RadioDropdown.prototype.showSelect = function (value) {
                var me = this,
                    scope = me.$scope,
                    text = '';
                if (value != undefined) {
                    var display = _.chain(me.itemList).filter(function (item, index) {
                        item.unSelect();
                        if (item.attrs.value == value) {
                            scope.keyIndex = index;
                            return true;
                        }
                        return false;
                    }).map(function (item) {
                        item.select();
                        scope.$selectedRow = item.itemObj;
                        return item.attrs.text;
                    }).value();
                    text = display.join(me.valueSeparator);
                    if (text || scope.unmatchRemove) {
                        scope.display = text;
                    } else {
                        if (!scope.unmatchHide) {
                            scope.display = value;
                        }
                    }
                } else {
                    scope.$selectedRow = {};
                    scope.display = '';
                }
            };
            return RadioDropdown;
        })(BaseDropdown);

        /*复选框列表 */
        CheckBoxDropdown = (function (superClass) {
            extend(CheckBoxDropdown, superClass);

            function CheckBoxDropdown($scope, $attrs, $controller, $timeout, itemList) {
                var self;
                this.$scope = $scope;
                this.$attrs = $attrs;
                this.$timeout = $timeout;
                this.itemList = !!itemList ? itemList : [];
                CheckBoxDropdown.__super__.constructor.call(this, this.$scope, this.$attrs, this.$controller, this.$timeout, this.itemList);
                self = this;
                //对scope.$source分组、排序
                if ($scope.groupExpress) {
                    if ($scope.source && !angular.isArray($scope.source)) {
                        $scope.scope = myController.transObjToArr($scope.source);
                    }
                    createGroupSource(this.$scope);
                }
            };

            function createGroupSource(scope) {
                var groupFlag = "";
                sortGroupSource(scope);
                //设置分组首行标识
                for (var item in scope.source) {
                    if (groupFlag != scope.source[item][scope.groupExpress]) {
                        scope.source[item].groupBorder = true;
                        groupFlag = scope.source[item][scope.groupExpress];
                    }
                }
            }

            //对scope.$scoure分组
            function sortGroupSource(scope) {
                var groupProp, list, len,
                    source = scope.source,
                    groupMap = {},
                    sourceTemp = [],
                    groupExpress = scope.groupExpress;
                len = source.length;
                for (var i = 0; i < len; i++) {
                    groupProp = source[i][groupExpress];
                    if (groupMap[groupProp] === undefined) {
                        list = [];
                        list.push(source[i]);
                        groupMap[groupProp] = list;
                    } else {
                        groupMap[groupProp].push(source[i]);
                    }
                }
                for (var item in groupMap) {
                    sourceTemp = sourceTemp.concat(groupMap[item]);
                }
                scope.source = sourceTemp;
            }


            CheckBoxDropdown.prototype.selectItem = function (item) {
                var self = this;
                if (self.onBeforeSelect(item) === false) {
                    return;
                }
                var displayArray = [],
                    submitArray = [],
                    me = this,
                    myScope = this.$scope,
                    length = this.itemList.length,
                    i = 0;
                myScope.handInputChange = false;
                if (item.getSelect()) {
                    item.unSelect();
                } else {
                    item.select();
                }
                myScope.$selectedRow = [];
                for (i = 0; i < length; i++) {
                    var each = me.itemList[i];
                    if (each.getSelect()) {
                        displayArray.push(each.attrs.text);
                        submitArray.push(each.attrs.value);
                        myScope.$selectedRow.push(each.itemObj);
                    }
                }

                if (self.dropItemSelectAll) {
                    var allSelected = _.every(me.itemList, function (item) {
                        return item.isSelected;
                    });
                    if(allSelected)
                        self.dropItemSelectAll.select();
                    else
                        self.dropItemSelectAll.unSelect();
                }
                myScope.setModelValue(submitArray.join(me.valueSeparator));
                myScope.display = displayArray.join(me.valueSeparator);
                myScope.needFocus = true;
                myScope.inputText[0].focus();

                self.onSelect(item);
                if (myScope.timer) {
                    $timeout.cancel(myScope.timer);
                }
                me.apply();
            };

            CheckBoxDropdown.prototype.showSelect = function (value) {
                var me = this,
                    myScope = me.$scope,
                    valArray,
                    display,
                    text,
                    result;
                myScope.$selectedRow = [];
                if (!_(value).isEmpty()) {
                    valArray = value.split(me.valueSeparator);
                    display = _.chain(me.itemList).filter(function (item) {
                        if (item) {
                            item.unSelect();
                        }
                        result = _(valArray).filter(function (val) {
                            try {
                                return val == item.attrs.value;
                            } catch (e) {
                                return false;
                            }
                        });
                        return result.length > 0;
                    }).map(function (item) {
                        item.select();
                        myScope.$selectedRow.push(item.itemObj);
                        return item.attrs.text;
                    }).value();
                    text = display.join(me.valueSeparator);
                    if (text || me.$scope.unmatchRemove) {
                        if (myScope.handInputChange) {
                            myScope.display = myScope.handInputValue;
                        } else {
                            myScope.display = text;
                        }
                    } else {
                        if (!me.$scope.unmatchHide) {
                            me.$scope.display = value;
                        }
                    }
                } else {
                    angular.forEach(me.itemList, function (item) {
                        if (item) {
                            item.unSelect();
                        }
                    });
                    myScope.display = '';
                }
            };

            CheckBoxDropdown.prototype.displayInit = function (display, value) {
                var myScope = this.scope,
                    displayArr = display.split(myScope.valueSeparator),
                    valueArr = value.split(myScope.valueSeparator),
                    i,
                    length = displayArr.length;
                for (i = 0; i < length; i++) {
                    if (!myScope.$selectedRow[i]) {
                        myScope.$selectedRow[i] = {};
                    }
                    myScope.$selectedRow[i][myScope.displayExpress] = displayArr[i];
                    myScope.$selectedRow[i][myScope.valueProp] = valueArr[i];
                }
                //myScope.selectedRow = myScope.$selectedRow;

            };
            CheckBoxDropdown.prototype.filterSource = function (textArray) {
                var me = this,
                    scope = me.$scope,
                    sourceTemp,
                    displayTemp;
                sourceTemp = _(scope.sourceTemp).chain().filter(
                    function (item) {
                        var matchArray;
                        displayTemp = scope.displayGetter(item);
                        displayTemp = displayTemp.toUpperCase();
                        matchArray = _(textArray).filter(function (text) {
                            text = text.toUpperCase();
                            if (displayTemp && displayTemp.indexOf(text) != -1) {
                                return true;
                            }
                        });
                        return matchArray.length > 0;
                    }).value();
                scope.$source = sourceTemp;
            };

            CheckBoxDropdown.prototype.valueMatch = function (textArray, needSelect) {
                var me = this,
                    scope = me.$scope,
                    sortedText = [],
                    leftItems = [],
                    matchText = [],
                    leftText = [],
                    resultItems = [];
                //先对TextArray排序
                sortedText = _(textArray).chain()
                    .map(function (value) {
                        return value.toUpperCase();
                    }).sortBy(function (item) {
                        return item.length;
                    }).value();
                sortedText.reverse();
                //再全匹配
                _(me.itemList).each(function (item) {
                    var i, match = false;
                    for (i = 0; i < sortedText.length; i++) {
                        if (sortedText[i].toUpperCase() === item.attrs.text.toUpperCase()) {
                            item.select();
                            resultItems.push(item);
                            matchText.push(sortedText[i]);
                            match = true;
                            break;
                        }
                    }
                    if (!match) leftItems.push(item);
                });
                leftText = _(textArray).difference(matchText);
                if (_(leftText).isEmpty()) {
                    scope.keyIndex = -1;
                }
                //对剩余的做模糊匹配
                if(resultItems.length === 0){
                    _(leftText).each(function (item) {
                        var i, ele;
                        if (item.length > 0) {
                            for (i = 0; i < leftItems.length; i++) {
                                ele = leftItems[i];
                                if ((ele.attrs.text || '').indexOf(item) >= 0) {
                                    if (needSelect) {
                                        ele.select();
                                    }
                                    scope.keyIndex = _(me.itemList).findIndex(ele);
                                    resultItems.push(ele);
                                    leftItems.splice(i, 1);
                                    return;
                                }
                            }
                        }
                    });
                }

                return resultItems;
            };

            CheckBoxDropdown.prototype.refreshSelect = function (newValue, needSelect) {
                var me = this,
                    scope = me.$scope,
                    newValueArray,
                    selectItems = [],
                    display,
                    text;
                needSelect = needSelect !== false;
                scope.$selectedRow = [];
                scope.handInputChange = true;
                if (!_(newValue).isEmpty()) {
                    //做全角转换
                    if (scope.gDbc) {
                        newValue = toCDB(newValue);
                        scope.display = newValue;
                    }
                    scope.handInputValue = newValue;
                    newValueArray = newValue.split(me.valueSeparator);
                    //去左空格
                    newValueArray = _(newValueArray).map(function (value) {
                        return trimLeft(value);
                    });
                    if (scope.associateType === "selectFirst") {
                        //清空所有选项
                        _(me.itemList).each(function (item) {
                            item.unSelect();
                            item.removeSelectStyle();
                        });
                        selectItems = me.valueMatch(newValueArray, needSelect);
                        if (_(selectItems).isEmpty()) {
                            scope.keyIndex = -1;
                        }
                        display = _(selectItems).map(function (item) {
                            item.addSelectStyle();
                            scope.$selectedRow.push(item.itemObj);
                            return item.attrs.value;
                        });
                    } else {
                        display = _.chain(me.itemList).filter(function (item) {
                            item.unSelect();
                            return _(newValueArray).filter(function (val) {
                                return val == item.attrs.text;
                            }).length > 0;
                        }).map(function (item) {
                            item.select();
                            scope.$selectedRow.push(item.itemObj);
                            return item.attrs.value;
                        }).value();
                    }
                    text = display.join(me.valueSeparator);
                    if (text || scope.unmatchRemove) {
                        scope.setModelValue(text);
                    } else {
                        scope.setModelValue(newValue);
                    }
                } else {
                    if (scope.associateType === "selectFirst") {
                        scope.keyIndex = -1;
                        //清空当前行
                        _(me.itemList).each(function (item) {
                            item.unSelect();
                            item.removeSelectStyle();
                        });
                    }
                    scope.setModelValue("");
                }

                if (me.dropItemSelectAll) {
                    var allSelected = _.every(me.itemList, function (item) {
                        return item.isSelected;
                    });
                    if(allSelected)
                        me.dropItemSelectAll.select();
                    else
                        me.dropItemSelectAll.unSelect();
                }
            };

            CheckBoxDropdown.prototype.selectAll = function () {
                var me = this,
                    valueArr = [];

                if (me.$scope.timer) {
                    $timeout.cancel(me.$scope.timer);
                }

                if (me.dropItemSelectAll.getSelect()) {
                    me.dropItemSelectAll.unSelect();
                    me.$scope.setModelValue('');
                    me.showSelect('');
                } else {
                    me.dropItemSelectAll.select();
                    angular.forEach(me.itemList, function (item) {
                        valueArr.push(item.attrs.value);
                    });
                    me.showSelect(valueArr.join(me.valueSeparator));
                    me.$scope.setModelValue(valueArr.join(me.valueSeparator));
                }
                me.$scope.needFocus = true;
                me.$scope.inputText[0].focus();
                me.apply();
            };

            return CheckBoxDropdown;

        })(BaseDropdown);

        DropdownFactory = {
            create: function ($scope, $attrs, $controller, $timeout) {

                var simpleList;
                switch ($scope.listType) {
                    case "single":
                        simpleList = new RadioDropdown($scope, $attrs, $controller, $timeout);
                        break;
                    case "multi":
                        simpleList = new CheckBoxDropdown($scope, $attrs, $controller, $timeout);
                        break;
                    default:
                        simpleList = new BaseDropdown($scope, $attrs, $controller, $timeout);
                        break;
                }
                return simpleList;
            }
        };

        return {
            scope: {
                source: '=',
                valueProp: '@',
                displayExpress: '@',
                valueSeparator: '@',
                groupExpress: '@',
                addEvent: '&',
                listType: '@',
                placeholder: '@',
                disabled: '=',
                readonly: '=',
                defaultOption: '=',
                selectedRow: '=',
                ngModelInit: '=ngModel',
                onSelect: '&',
                onBeforeSelect: '&',
                ngDisabled: '=',
                ngReadonly: '='
            },
            replace: true,
            transclude: false,
            require: ['^?ngModel', '?gDropdown'],
            template: '<div ng-cloak class="form-dorpdown" ng-class="{\'is-show-menu\': isShow}" verify-target><input type="text" autocomplete="off" ondrop="return false;" ondragstart="return false" ng-class="{\'is-show-menu\': isShow}" verify-target class="form-text" ng-disabled="ngDisabled || disabled || unfilter || readonly || ngReadonly" ng-model="display" placeholder="请选择" >' +
            '<a href="javascript:void(0)" type="button" ng-click="showDropDown()" tabindex="-1" class="btn dropdown-toggle"> <i class="fi fi-caret"></i></a>' +
            '</div>',
            restrict: 'E',
            controller: function ($scope, $element, $attrs) {
                /*var $input = $element.find("input");
                if ($element.attr("name")) {
                    $input.attr("name", $element.attr("name"));
                    $element.removeAttr("name");
                }
                $tabindex.register($input, $element);*/
                $tabindex.register($element.find("input"), $element);
                return DropdownFactory.create($scope, $attrs, this, $timeout);
            },
            compile: function (tElement) {
                tElement.find("input").attr('ng-change', 'refreshSelect()');
                return function (scope, element, attrs, controllers) {
                    /*初始化参数*/
                    var ngModel = controllers[0],
                        myController = controllers[1],
                        inputText = element.find("input"),
                        displayExpress,
                        valueProp,
                        ulElement;
                    scope.keyIndex = -1;
                    scope.inputText = inputText;
                    scope.isShow = false;
                    scope.scrollY = false;
                    scope.inputTextValue = "";
                    scope.handInputChange = false;
                    scope.tabBlur = false;
                    scope.handInput = false;//子指令是否为页面上手输
                    scope.gDbc = angular.isDefined(attrs.gDbc);
                    scope.unmatchRemove = attrs.unmatchRemove == "true" || false;//不匹配的是否自动删除
                    scope.unmatchHide = attrs.unmatchHide == "true" || false;
                    scope.unfilter = attrs.unfilter == "true" || false;
                    scope.filter = attrs.unfilter == "false" || false;
                    scope.associateType = attrs.associateType || "";
                    var isEdge = /(Edge\/)/i.test(navigator.userAgent);
                    if (isEdge && inputText.val() === "请选择") {
                        inputText.val("");
                    }
                    if(attrs.ngModel){
                        inputText.attr("id", attrs.ngModel);
                    }
                    //默认取配置文件的
                    if (config.controls.dropdown && config.controls.dropdown.associateType) {
                        scope.associateType = config.controls.dropdown.associateType;
                    }
                    scope.showEvent = attrs.showEvent == "click" ? "click" : "focus";
                    //默认取配置文件的
                    if (config.controls.dropdown && config.controls.dropdown.showEvent) {
                        scope.showEvent = config.controls.dropdown.showEvent;
                    }
                    //选项是否含code值
                    scope.displayCode = attrs.displayCode || "";
                    if (config.controls.dropdown && config.controls.dropdown.displayCode) {
                        scope.displayCode = config.controls.dropdown.displayCode;
                    }

                    scope.groupExpress = attrs.groupExpress || "";
                    scope.displayName = '';
                    scope.$selectedRow = scope.selectedRow || (scope.listType == "multi" ? [] : {});
                    displayExpress = scope.displayExpress = attrs.displayExpress ? attrs.displayExpress : "key";
                    valueProp = scope.valueProp = attrs.valueProp ? attrs.valueProp : "value";
                    scope.fuzzyMatch = attrs.fuzzyMatch == "true" || false;
                    scope.refreshSelect = function () {
                        var newVal = inputText.val();
                        myController.refreshSelect(newVal, false);
                    };
                    scope.isInKeydownNewRowGrid = inputText.parents('.grid-keydown-new-row').length > 0;

                    if (attrs.disabled == 'disabled') {
                        scope.disabled = true;
                    }
                    if (attrs.readonly == 'readonly') {
                        scope.readonly = true;
                    }

                    if (angular.isDefined(attrs.lazyRenderDropItems)) {
                        scope.lazyRenderDropItems = attrs.lazyRenderDropItems === 'true';
                    } else if (config.controls && config.controls.dropdown && config.controls.dropdown.lazyRenderDropItems) {
                        switch (config.controls.dropdown.lazyRenderDropItems) {
                            case 'all':
                                scope.lazyRenderDropItems = true;
                                break;
                            case 'readonly':
                                scope.lazyRenderDropItems = scope.disabled || scope.readonly || scope.ngDisabled || scope.ngReadonly;
                                break;
                            default:
                                scope.lazyRenderDropItems = false;
                                break;
                        }
                    }

                    angular.element(window).on("mousewheel.dropDown" + scope.$id, function (e) {
                        if (!scope.isShow) return;
                        var ul = angular.element(e.target).closest("ul");
                        if (ul.length == 0 || ul[0] != ulElement[0]) {
                            scope.isShow = false;
                            myController.apply();
                        }
                    });

                    function renderUlElement() {
                        if (!ulElement) {
                            ulElement = GillionLocationService.getTopCompile()('<ul ng-show="isShow" class="dropdown-menu form-dorpdown-menu" >' +
                                '<li ng-show="addShow" class="form-dorpdown-additem" ng-click="addEvent()"><button class="btn"><i class="fi fi-add-circle"></i></button></li></ul>')(scope);
                            ulElement = GillionLocationService.createHtmltoTop(ulElement[0]);
                            scope.ulElement = ulElement;

                            renderDropItems();
                            ulElement.data(DROPITEMOBJ, myController);
                            ulElement.on("scroll", function () {
                                if (scope.timer) {
                                    $timeout.cancel(scope.timer);
                                }
                                scope.isShow = true;
                            });

                            ulElement.on('click', '[data-drop-item]', function () {
                                var topJq = GillionLocationService.getTopJq();
                                var $li = topJq(this);
                                var index = $li.data('index');
                                var dropdownItem = myController.itemList[index];
                                myController.selectItem(dropdownItem);
                            });
                            ulElement.on('click', '[data-select-all]', function () {
                                myController.selectAll();
                            });
                        }
                        return ulElement;
                    }

                    angular.element(window).on("unload.dropdown", function () {
                        scope.isShow = false;
                        scope.ulElement.hide();
                    });

                    //下拉框显示隐藏
                    scope.showDropDown = function () {
                        if (scope.disabled || scope.readonly || scope.ngDisabled || scope.ngReadonly) {
                            return;
                        }
                        renderUlElement();
                        scope.isShow = !scope.isShow;
                        if (scope.isShow) {
                            //下拉框定位
                            var docWindow = GillionLocationService.getTopWindow(window);
                            var location = GillionLocationService.calculateLocation(inputText);
                            ulElement.removeClass("ng-hide");
                          var ulWidth = ulElement[0].offsetWidth,
                            ulHeight;
                          if (scope.source) {
                            if (typeof scope.source === 'object') {
                             ulHeight =  Object.keys(scope.source).length * 26 // 针对数据源为对象类型的
                            } else { 
                              ulHeight = scope.source.length * 26 //改成计算方式, 通过下面方式及ulElement.height()会触发表格重新渲染
                            }
                          } else { 
                            ulHeight = 26
                          }
                            /* if (ulElement.css("display") == "none") {
                                ulElement.css("display", "block");
                                ulWidth = ulElement[0].offsetWidth;
                                ulHeight = ulElement[0].offsetHeight;
                                ulElement.css("display", "none");
                            } */
                            ulHeight = ulHeight >= 150 ? 150 : ulHeight;
                            ulElement.css("left", location.left);
                            if (location.bottom > ulHeight && (location.top + ulHeight + inputText[0].offsetHeight) < docWindow.document.documentElement.clientHeight) {
                                ulElement.css("top", location.top + inputText[0].offsetHeight - 1);
                            } else {
                                ulElement.css("top", location.top - ulHeight - 2);
                            }
                            ulElement.css("display", "block");
                            ulElement.css("min-width", inputText.closest('div').width());
                            scope.needFocus = true;
                            //inputText[0].focus();
                            if (window.document.documentMode <= 9) {
                                var range = inputText[0].createTextRange();
                                range.moveStart('character', inputText.val().length);
                                range.collapse(true);
                                range.select();
                            } else {
                                inputText.focus();
                            }
                        }
                    };

                    if (scope.source && !angular.isArray(scope.source)) {
                        scope.$source = myController.transObjToArr(scope.source);
                    } else {
                        scope.$source = angular.copy(scope.source);
                    }
                    if (!_(scope.displayCode).isEmpty()) {
                        scope.$source = joinCodeAndName(scope.$source, scope.displayCode, scope.displayExpress, scope.valueProp);
                    }

                    scope.sourceTemp = angular.copy(scope.$source);
                    var returnParamFn = function (arg) {
                        return arg;
                    };
                    var valueGetter = !!scope.valueProp ? $parse(scope.valueProp) : returnParamFn;
                    scope.displayGetter = !!scope.displayExpress ? $parse(scope.displayExpress) : returnParamFn;
                    scope.valueGetter = valueGetter;

                    //宽度
                    if (angular.isDefined(attrs.width)) {
                        element.css("width", attrs.width);
                    }
                    if (angular.isDefined(attrs.cssClass)) {
                        element.addClass(attrs.cssClass);
                    }
                    scope.setModelValue = function (val) {
                        if (ngModel) {
                            ngModel.$setViewValue(val);
                            if(val === "") ulElement.scrollTop(0);
                        }
                    };
                    scope.getModelValue = function () {
                        if (ngModel) {
                            return ngModel.$modelValue;
                        }
                    };
                    if (ngModel) {
                        ngModel.$formatters.push(function (value) {
                            scope.setModelValue(value);
                            if (scope.unmatchHide && (myController.itemList || myController.itemList.length == 0)) {
                                scope.display = '';
                            }
                            myController.showSelect(value);
                            if (inputText.val() != '' && angular.isDefined(attrs.onSelect)) {
                                scope.onSelect({
                                    list: myController,
                                    item: scope.$selectedRow
                                });
                            }
                            return value;
                        });

                    }

                    if (attrs.addEvent) {
                        scope.addShow = true;
                    }

                    if (scope.placeholder) {
                        inputText.attr("placeholder", scope.placeholder);
                    }

                    //默认选项
                    if (attrs.defaultOption) {
                        if (attrs.defaultOption.indexOf("{") != -1) {
                            scope.defaultOption = JSON.parse(attrs.defaultOption);
                        }
                        myController.addDefaultOption();
                    }
                    //手动添加的子指令
                    // transclude(scope, function (clone) {
                    //     angular.forEach(clone, function (each) {
                    //         if (each.tagName == 'LI' && !(angular.element(each).hasClass("checkbox-all"))) {
                    //             scope.handInput = true;
                    //         }
                    //     });
                    //     ulElement.prepend(clone);
                    // });


                    function blurFun () {
                        scope.handInputChange = false;
                        scope.needFocus = false;
                        this.selectFlag = false;
                        if (!scope.isShow) {
                            if (ngModel) {
                                myController.showSelect(ngModel.$modelValue);
                                myController.apply();
                            }
                        } else {
                            //ulElement.hide();
                            scope.timer = $timeout(function () {
                                if (ngModel) {
                                    myController.showSelect(ngModel.$modelValue);
                                }
                                scope.isShow = false;
                                if (ngModel) {
                                    myController.showSelect(ngModel.$modelValue);
                                }
                                myController.apply();
                            }, 200);
                        }
                    };
                    inputText.on('blur', blurFun);

                    var clickFun = function (event) {
                        if (scope.disabled || scope.readonly) {
                            return;
                        }
                        if (scope.timer) {
                            $timeout.cancel(scope.timer);
                        }
                        if (!ulElement) {
                            return;
                        }
                        var target = event.srcElement || event.target;
                        if (scope.isShow) {
                            if (element.find(target).length === 0 && ulElement.find(target).length === 0
                                && target != ulElement[0]) {

                                scope.isShow = false;
                                if (ngModel) {
                                    myController.showSelect(ngModel.$modelValue);
                                }
                                myController.apply();
                                scope.needFocus = false;
                            }
                        } else {
                            if (inputText.val() != '' && (element.find(target).length > 0 || ulElement.find(target).length > 0 || target == ulElement[0])) {
                                scope.refreshSelect();
                                scope.handInputChange = false;
                            }
                        }
                    };
                    //点击隐藏
                    $document.on('mousedown.dropDown' + scope.$id, clickFun);
                    if (window.parent != window) {
                        angular.element(window.parent).on('click.dropdown' + scope.$id, clickFun);
                    }

                    //刷新时清空 （非手动输入子指令）
                    if (!scope.handInput) {
                        scope.$watchCollection("source", function () {
                            if (!angular.isArray(scope.source)) {
                                scope.$source = myController.transObjToArr(scope.source);
                            } else {
                                scope.$source = angular.copy(scope.source);
                            }
                            if (attrs.defaultOption) {
                                if (attrs.defaultOption.indexOf("{") != -1) {
                                    scope.defaultOption = JSON.parse(attrs.defaultOption);
                                }
                                myController.addDefaultOption();
                            } else {
                                if (!_(scope.displayCode).isEmpty()) {
                                    scope.$source = joinCodeAndName(scope.$source, scope.displayCode, scope.displayExpress, scope.valueProp);
                                }
                            }
                            scope.sourceTemp = angular.copy(scope.$source);
                            //if (arguments[0] && !arguments[1]) {
                            renderDropItems();
                            //}
                            var value =ngModel.$modelValue;
                            scope.setModelValue(value);
                            if (scope.unmatchHide && (myController.itemList || myController.itemList.length == 0)) {
                                scope.display = '';
                            }
                            myController.showSelect(value);
                            if (inputText.val() != '' && angular.isDefined(attrs.onSelect)) {
                                scope.onSelect({
                                    list: myController,
                                    item: scope.$selectedRow
                                });
                            }

                            //ngModel.$setViewValue()
                        });
                    }


                    if (attrs.disabled) {
                        scope.$watch("disabled", function (newVal) {
                            if (newVal) {
                                scope.disabled = true;
                                element.attr("disabled", "disabled");
                            } else {
                                scope.disabled = false;
                                element.removeAttr("disabled");
                            }
                        })
                    }

                    if (attrs.readonly) {
                        scope.$watch("readonly", function (newVal) {
                            if (newVal) {
                                scope.readonly = true;
                                element.attr("readonly", "readonly");
                            } else {
                                scope.readonly = false;
                                element.removeAttr("readonly");
                            }
                        })
                    }

                    // 监控selectedRow变化
                    if (attrs.selectedRow) {
                        scope.$watch("$selectedRow", function (newVal) {
                            myController.onBeforeSelect();
                            scope.selectedRow = newVal;
                        })
                    }

                    // if (scope.lazyRenderDropItems) {
                    //     var unWatchIsShow = scope.$watch('isShow', function (val) {
                    //         if (val) {
                    //             scope.lazyRenderDropItems = false;
                    //             doRenderDropItems();
                    //             unWatchIsShow();
                    //         }
                    //     });
                    // }

                    //定位
                    inputText.on(scope.showEvent, function (e) {
                        if (scope.disabled || scope.readonly || scope.ngDisabled || scope.ngReadonly) {
                            return;
                        }
                        if (GillionMsgService.isUnderMasked(inputText[0])) {
                            return;
                        }

                        if (scope.needFocus) {
                            //点击后要聚焦 但不做任何事
                            scope.needFocus = false;
                            return;
                        }
                        renderUlElement();
                        var docWindow = GillionLocationService.getTopWindow(window);
                        var location = GillionLocationService.calculateLocation(inputText);
                        ulElement.removeClass("ng-hide");
                        var ulWidth = ulElement[0].offsetWidth;
                        var ulHeight;
                        /* if (ulElement.css("display") == "none") {
                            ulElement.css("display", "block");
                            ulWidth = ulElement[0].offsetWidth;
                            ulHeight = ulElement[0].offsetHeight;
                            ulElement.css("display", "none");
                        } */
                        if (scope.source) {
                          if (typeof scope.source === 'object') {
                           ulHeight =  Object.keys(scope.source).length * 26 // 针对数据源为对象类型的
                          } else { 
                            ulHeight = scope.source.length * 26 //改成计算方式, 通过下面方式及ulElement.height()会触发表格重新渲染
                          }
                        } else { 
                          ulHeight = 26
                        }
                        ulElement.css("left", location.left);
                        if (location.bottom > ulHeight && (location.top + ulHeight + inputText[0].offsetHeight) < docWindow.document.documentElement.clientHeight) {
                            ulElement.css("top", location.top + inputText[0].offsetHeight - 1);
                        } else {
                            ulElement.css("top", location.top - ulHeight - 2);
                        }
                        ulElement.css("min-width", inputText.closest('div').width());
                        ulElement.css("display", "block");
                        if (this.selectFlag) {
                            //inputText.focus();
                            if (window.document.documentMode <= 9) {
                                var range = inputText[0].createTextRange();
                                range.moveStart('character', inputText.val().length);
                                range.collapse(true);
                                range.select();
                            } else {
                                if(document.activeElement!=inputText[0]){
                                    inputText.focus();
                                }

                            }
                        } else {
                            inputText.select();
                            this.selectFlag = true;
                        }
                        scope.isShow = true;
                        scope.refreshSelect();
                        myController.apply();
                    });
                    inputText.on("keydown", function (e) {
                        var currKey = e.keyCode || e.which || e.charCode,
                            keyIndex = scope.keyIndex,
                            keyLength = ulElement.find("li[ng-show!='addShow']").length;
                        scope.inputTextValue = inputText.val();
                        //回车
                        if (currKey == 13) {
                            if (scope.isShow) {
                                if (myController.dropItemSelectAll && keyIndex == keyLength - 1) {
                                    myController.selectAll();
                                } else {
                                    var item = myController.itemList[keyIndex];
                                    if (item) {
                                        if (scope.associateType === "selectFirst" && scope.listType != "multi") {
                                            scope.isShow = false;
                                            if (scope.inputTextValue != item.attrs.text) {
                                                item.element[0].click();
                                            } else {
                                                myController.selectItem(item);
                                            }
                                            myController.apply();
                                        } else {
                                            item.removeSelectStyle();
                                            item.element[0].click();
                                            if (scope.listType != "multi") {
                                                keyIndex = -1;
                                            }
                                            scope.isShow = false;
                                            myController.apply();
                                        }
                                    }
                                }
                            }
                            e.stopPropagation();
                            e.preventDefault();
                        } else if (currKey == 40) {
                            e.preventDefault();
                            if (!scope.isShow && scope.isInKeydownNewRowGrid) {
                                return;
                            }
                            e.stopPropagation();
                        } else if (currKey == 38 || currKey == 32) {
                            e.stopPropagation();
                            e.preventDefault();
                        } else if (currKey == 9) {
                            if (scope.isShow && scope.keyIndex >= 0 && !myController.itemList[scope.keyIndex].getSelect()) {
                                myController.selectItem(myController.itemList[scope.keyIndex]);
                            }
                        }
                    })

                    //输入框键盘输入事件
                    inputText.on("keyup", function (e) {
                        var selectValue,
                            keyIndex = scope.keyIndex,
                            currKey = e.keyCode || e.which || e.charCode,
                            keyLength = ulElement.find("li[ng-show!='addShow']").length;
                        switch (currKey) {
                            //方向上键
                            case 38:
                                if (e.altKey && !scope.isShow) {
                                    inputText.trigger(scope.showEvent);
                                }
                                var keyNextIndex = keyIndex < 0 ? keyIndex + keyLength : keyIndex;
                                scope.keyIndex = keyIndex = keyIndex < 0 ? keyIndex + keyLength : (keyIndex - 1 + keyLength) % keyLength;
                                if (myController.dropItemSelectAll) {
                                    if (keyIndex == keyLength - 1) {
                                        myController.dropItemSelectAll.addSelectStyle();
                                        myController.itemList[keyNextIndex].removeSelectStyle();
                                    } else {
                                        myController.dropItemSelectAll.removeSelectStyle();
                                        myController.itemList[keyIndex].addSelectStyle();
                                        if (keyNextIndex < keyLength - 1)
                                            myController.itemList[keyNextIndex].removeSelectStyle();
                                    }
                                } else {
                                    ulElement.find("li[ng-show!='addShow']:eq(" + keyNextIndex + ")").removeClass("current");
                                    ulElement.find("li[ng-show!='addShow']:eq(" + keyIndex + ")").addClass("current");
                                }

                                if (keyIndex > 4) {
                                    ulElement[0].scrollTop = (keyIndex - 4) * 25;
                                } else {
                                    ulElement[0].scrollTop = 0;
                                }
                                //没有显示下拉框时
                                if (scope.associateType === "selectFirst" && scope.listType != "multi") {
                                    if (!(scope.disabled || scope.readonly || scope.ngDisabled || scope.ngReadonly)) {
                                        selectValue = (myController.itemList[keyIndex].attrs.text || '').replace("\n", "");
                                        myController.refreshSelect(selectValue);
                                        myController.apply();
                                        inputText.val(selectValue);
                                    }
                                }
                                e.stopPropagation();
                                e.preventDefault();
                                break;
                            //方向下键
                            case 40:
                                if (e.altKey && !scope.isShow) {
                                    inputText.trigger(scope.showEvent);
                                }
                                var keyLastIndex = keyIndex < 0 ? keyIndex + keyLength : keyIndex;
                                scope.keyIndex = keyIndex = (keyIndex + 1) % keyLength;
                                if (myController.dropItemSelectAll) {
                                    if (keyIndex == keyLength - 1) {
                                        myController.dropItemSelectAll.addSelectStyle();
                                        myController.itemList[keyLastIndex].removeSelectStyle();
                                    } else {
                                        myController.dropItemSelectAll.removeSelectStyle();
                                        myController.itemList[keyIndex].addSelectStyle();
                                        if (keyLastIndex < keyLength - 1)
                                            myController.itemList[keyLastIndex].removeSelectStyle();
                                    }
                                } else {
                                    ulElement.find("li[ng-show!='addShow']:eq(" + keyLastIndex + ")").removeClass("current");
                                    ulElement.find("li[ng-show!='addShow']:eq(" + keyIndex + ")").addClass("current");
                                }
                                if (keyIndex > 4) {
                                    ulElement[0].scrollTop = (keyIndex - 4) * 25;
                                } else {
                                    ulElement[0].scrollTop = 0;
                                }
                                //没有显示下拉框时
                                if (scope.associateType === "selectFirst" && scope.listType != "multi") {
                                    if (!(scope.disabled || scope.readonly || scope.ngDisabled || scope.ngReadonly)) {
                                        selectValue = (myController.itemList[keyIndex].attrs.text || '').replace("\n", "");
                                        myController.refreshSelect(selectValue);
                                        myController.apply();
                                        inputText.val(selectValue);
                                    }
                                }
                                e.stopPropagation();
                                e.preventDefault();
                                break;
                            //空格键
                            case 32:
                                if (navigator.userAgent.indexOf("Safari") > 0) {
                                    return false;
                                }
                                if (window.event.ctrlKey || !scope.isShow) {
                                    return false;
                                }
                                if (scope.inputTextValue !== inputText.val()) {
                                    return false;
                                }
                                if (myController.dropItemSelectAll && keyIndex == keyLength - 1) {
                                    myController.selectAll();
                                } else {
                                    var item = myController.itemList[keyIndex];
                                    if (item) {
                                        if (scope.associateType === "selectFirst" && scope.listType != "multi") {
                                            scope.isShow = false;
                                            if (scope.inputTextValue != item.attrs.text) {
                                                item.element[0].click();
                                            }
                                            myController.apply();
                                        } else {
                                            item.removeSelectStyle();
                                            if (scope.listType != "multi") {
                                                scope.keyIndex = keyIndex = -1;
                                            }
                                            item.element[0].click();
                                        }
                                    }
                                }
                                return false;
                                break;
                            //回车键
                            case 13:
                                break;
                            //tab键
                            case 9:
                                break;
                            default:
                                if (!scope.isShow) {
                                    inputText.trigger(scope.showEvent);
                                }
                                break;
                        }
                    });

                    var destroy = function () {
                        angular.forEach(myController.itemList, function (item) {
                            for (var key in item) {
                                delete item[key];
                            }
                        });
                        delete myController.itemList;
                        inputText.off();
                        $document.off('.dropDown' + scope.$id);
                        angular.element(window).off('.dropdown' + scope.$id);
                        angular.element(window.parent).off('.dropdown' + scope.$id);
                        clickFun = undefined;
                        ulElement.off();
                        ulElement.removeData();
                        ulElement.remove();
                    };

                    scope.$on('$destroy', function () {
                        destroy();
                    });

                    function renderDropItems () {
                        // console.time('renderDropItems');
                        var lis = '';
                        var dropdownItems;
                        var listTypeClass;
                        switch (scope.listType) {
                            case 'single':
                                listTypeClass = 'fi-radiobox';
                                break;
                            case 'multi':
                                listTypeClass = 'fi-checkbox';
                                break;
                            default:
                                listTypeClass = '';
                        }
                        var itemSource = scope.$source || [];
                        var selectAllItem, selectAllHtml = '';
                        var tagSource = _.chain(tElement.context.children)
                            .filter(function (child) {
                                if (child.tagName && child.tagName.toUpperCase() === 'G-DROP-SELECT-ALLITEM') {
                                    selectAllItem = child;
                                }
                                return child.tagName && child.tagName.toUpperCase() === 'G-DROPITEM';
                            })
                            .map(function (node) {
                                var $node = angular.element(node);
                                var item;
                                if ($node.attr('item')) {
                                    item = JSON.parse($node.attr('item'));
                                } else {
                                    item = {};
                                    item[displayExpress] = $node.attr('text') || $node.text();
                                    item[valueProp] = $node.attr('value');
                                }
                                return item;
                            })
                            .value();
                        var itemSource = itemSource.concat(tagSource);
                        dropdownItems = _.map(itemSource, function (item, index) {
                            var dropdownItem = {
                                isSelected: false,
                                itemObj: item,
                                attrs: {
                                    value: scope.valueGetter(item),
                                    text: scope.displayGetter(item),
                                    item: item
                                },
                                select: function() {
                                    if (this.element) this.element.attr("selected","selected");
                                    if (this.element) this.element.addClass('current');
                                    this.isSelected = true;
                                },
                                unSelect: function() {
                                    if (this.element) this.element.removeAttr("selected");
                                    if (this.element) this.element.removeClass('current');
                                    this.isSelected = false;
                                },
                                getSelect: function(){
                                    return !!this.isSelected;
                                },
                                addSelectStyle: function(){
                                    if (this.element) this.element.addClass('current');
                                },
                                removeSelectStyle: function(){
                                    if (this.element) this.element.removeClass('current');
                                }
                            };
                            var style = '';
                            if (scope.groupExpress) {
                                if (item) {
                                    if (item.groupBorder === true) {
                                        style = 'style="border-top: solid 1px #c4c4c4"';
                                        // dropdownItem.element.css("border-top","solid 1px #c4c4c4");
                                    } else {
                                        // dropdownItem.element.css("border-top","solid 0px #c4c4c4");
                                        style = 'style="border-top: solid 0px #c4c4c4"';
                                    }
                                }
                            }
                            var li = '';
                            li += '<li data-drop-item data-index="' + index + '"' + style + '>';
                            li +=   '<a href="javascript:void(0)">';
                            li +=       '<i class="fi ' + listTypeClass + '"></i>';
                            li +=       dropdownItem.attrs.text;
                            li +=   '</a>';
                            li += '</li>';
                            lis += li;
                            return dropdownItem;
                        });
                        scope.dropdownItemsHtml = lis;
                        if (selectAllItem) {
                            selectAllHtml += '<li data-select-all class="checkbox-all">';
                            selectAllHtml +=    '<a href="javascript:void(0)">';
                            selectAllHtml +=        '<i class="fi fi-checkbox" ></i>';
                            selectAllHtml +=        selectAllItem.innerText;
                            selectAllHtml +=    '</a>';
                            selectAllHtml += '</li>';
                            myController.dropItemSelectAll = {
                                isSelected: false,
                                select: function() {
                                    if (this.element) this.element.attr("selected","selected");
                                    this.isSelected = true;
                                },
                                unSelect: function() {
                                    if (this.element) this.element.removeAttr("selected");
                                    this.isSelected = false;
                                },
                                getSelect: function(){
                                    return !!this.isSelected;
                                },
                                addSelectStyle: function(){
                                    if (this.element) this.element.addClass('current');
                                },
                                removeSelectStyle: function(){
                                    if (this.element) this.element.removeClass('current');
                                }
                            };
                        }
                        scope.selectAllHtml = selectAllHtml;
                        myController.itemList = dropdownItems;
                        if (!scope.lazyRenderDropItems) {
                            doRenderDropItems();
                        }
                        // $timeout(blurFun);
                        // console.timeEnd('renderDropItems');
                    }
                    function doRenderDropItems () {
                        // console.time('doRenderDropItems');
                        var topJq = GillionLocationService.getTopJq();
                        if(!scope.ulElement){
                            renderUlElement();
                        }
                        var ulElement = scope.ulElement;
                        var dropdownItemsHtml = scope.dropdownItemsHtml;
                        var dropdownItems = myController.itemList;
                        var selectAllHtml = scope.selectAllHtml;
                        var selectedRow = scope.selectedRow || scope.$selectedRow;
                        var selectAllElement;
                        if (dropdownItemsHtml) {
                            ulElement.children('li[data-drop-item], li[data-select-all]').remove();
                            ulElement.prepend(dropdownItemsHtml);
                            _.forEach(ulElement.children(), function (el, i) {
                                var $el;
                                if (dropdownItems[i]) {
                                    $el = topJq(el);
                                    dropdownItems[i]['element'] = $el;
                                    if (dropdownItems[i].isSelected
                                        || dropdownItems[i].itemObj === selectedRow
                                    ) {
                                        dropdownItems[i].addSelectStyle();
                                        if (scope.listType) {
                                            $el.attr('selected', 'selected');
                                        }
                                    }
                                }
                            });
                        }
                        if (selectAllHtml) {
                            selectAllElement = topJq(selectAllHtml);
                            ulElement.prepend(selectAllElement);
                            if (myController.dropItemSelectAll) myController.dropItemSelectAll.element = selectAllElement;
                            if (myController.dropItemSelectAll.isSelected) {
                                myController.dropItemSelectAll.addSelectStyle();
                            }

                        }
                        // console.timeEnd('doRenderDropItems');
                    };

                };
            }
        };
    };
});
