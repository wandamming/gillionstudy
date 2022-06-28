
/**
 * @namespace utils.ArraysConstructor
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/17
 * Time: 8:28
 */
define(['angular', 'underscore'], function (angular, _) {
    var arrayProto = Array.prototype;

    return function ($filter, Predicates) {
        return {
            /**
             * 构建树数据
             * @description 请尽量使用后端构建树数据， 在js中构建树数据是低效的做法
             * @param {Array} source 源数据
             * @param {Object} [config] 配置项
             * @param {String} [config.prop = 'id'] 元素的主要属性名称,与父属性作比较的属性的名称
             * @param {String} [config.parentProp = 'parentId'] 父属性名称
             * @param {String} [config.childrenProp = 'children'] 子集属性名称
             * @return {Array}
             */
            buildTree: function (source, config) {
                source = angular.copy(source);
                config = config || {};
                var prop = angular.isString(config.prop) ? config.prop : 'id',
                    parentProp = angular.isString(config.parentProp) ? config.parentProp : 'parentId',
                    childrenProp = angular.isString(config.childrenProp) ? config.childrenProp : 'children',
                    results = [],
                    me = this,
                    fetchChildrenFn = function (element, margin) {
                        if (margin.length === 0) return;
                        var children = [],
                            i, len, el, childrenMargin;
                        for (i = 0, len = margin.length; i < len; i++) {
                            el = margin[i];
                            if (el[parentProp] === element[prop]) {
                                children.push(el);
                            }
                        }
                        childrenMargin = me.subtract(margin, children);
                        for (i = 0, len = children.length; i < len; i++) {
                            el = children[i] = angular.copy(children[i]);
                            fetchChildrenFn(el, childrenMargin);
                        }
                        if (children.length > 0) {
                            element[childrenProp] = children;
                        }
                    },
                    margin, i, len, el;
                for (i = 0, len = source.length; i < len; i++) {
                    el = source[i];
                    if (!el[parentProp]) {
                        results.push(el);
                    }
                }
                margin = me.subtract(source, results);
                // copy放在下面是为了subtract使用'==='而不是equals， 效率更高
                for (i = 0, len = results.length; i < len; i++) {
                    el = results[i] = angular.copy(results[i]);
                    fetchChildrenFn(el, margin);
                }
                return results;
            },
            /**
             * @deprecated 请使用 `angular.filters.orderBy`, 本方法仅作为简单排序
             * @param {Array} source 源数组，本方法不改变此数组
             * @param {string/Function/String[]/Function[]} [predicate] 比较器， 可用Array传入多个， 会按照顺序排序
             * @param {boolean} [reverse = false] 反转, 默认升序
             * @return {Array} 返回排序后的新数组
             */
            orderBy: function (source, predicate, reverse) {
                return $filter('orderBy')(source, predicate, reverse);
            },
            /**
             * 抽取源数组中对象的一个属性成一个新的数组
             * @param {Array} source 源数组
             * @param {String} prop 抽取的属性名称
             * @return {Array} 抽取后结果
             * @deprecated @see Arrays.extract
             */
            extractToArray: function (source, prop) {
                var results = [],
                    i, len, el;
                if (angular.isArray(source))  {
                    for (i = 0, len = source.length; i < len; i++) {
                        el = source[i];
                        if (el && el.hasOwnProperty(prop)) {
                            results[i] = el[prop];
                        }
                    }
                }
                return results;
            },

            /**
             * 抽取源数组中对象的一个属性成一个新的数组
             * @param {Array} source 源数组
             * @param {String|Function} extractor
             * @return {Array} 抽取后结果
             */
            extract: function (source, extractor) {
                var results = [],
                    extractorIsFn = angular.isFunction(extractor),
                    i, len, el;
                if (angular.isArray(source))  {
                    for (i = 0, len = source.length; i < len; i++) {
                        el = source[i];
                        if (el) {
                            if (extractorIsFn) {
                                results[i] = extractor(el);
                            } else if (el.hasOwnProperty(extractor)) {
                                results[i] = el[extractor];
                            }
                        }
                    }
                }
                return results;
            },

            /**
             * 抽取源数组中对象的两个属性， 组合成Map (对象字面量)
             * @param {Array} source 源数组
             * @param {String} keyProp 要提取为Map中的Key值的属性名
             * @param {String} valProp 要提取为Map中的Value值的属性名
             * @return {Object} 抽取后的结果
             */
            extractToMap: function (source, keyProp, valProp) {
                var results = {},
                    i, len, el;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        el = source[i];
                        if (el && el.hasOwnProperty(keyProp) && el.hasOwnProperty(valProp)) {
                            results[source[i][keyProp]] = source[i][valProp];
                        }
                    }
                }
                return results;
            },

            /**
             * 返回 `a` 数组扣除`b`数组中元素的结果
             * @param a {Array} 源数组
             * @param b {Array} 减去的数组
             * @param [predicateBuilder] {function(bEle:Object): function(aEle:Object):boolean} 创造匹配谓词的高阶函数
             * @returns different {Array}
             */
            subtract: _.difference,

            /**
             * 判断源数组中是否存在某元素， 使用`angular.equals` 或 `谓词` 判断
             * @param {Object} source 源数组
             * @param {Object/function(element:Object):boolean} element 元素
             */
            exists: function (source, element) {
                var x = angular.isArray(source) ? source : [],
                    predicate = angular.isFunction(element) ? element : Predicates.newEqPredicate(element),
                    i = 0,
                    len = x.length;
                if (angular.isArray(x)) {
                    for (; i < len; i++) {
                        if (predicate(x[i]) === true) {
                            return true;
                        }
                    }
                }
                return false;
            },

            /**
             * 过滤源数组， 返回匹配的元素数组
             * @param {Array} source 源数组
             * @param {function(Object):boolean} predicate 匹配器
             * @return {Array}
             */
            filter: function (source, predicate) {
                var results = [],
                    i, len, element;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        element = source[i];
                        if (predicate(element) === true) {
                            results.push(element);
                        }
                    }
                }
                return results;
            },

            /**
             * 在源数组中使用匹配器查找， 返回第一个找到的元素
             * @param {Array} source 源数组
             * @param {function(Object):boolean} predicate 匹配器
             * @return {Object} 第一个找到的元素
             */
            findOne: function (source, predicate) {
                var i, len, element;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        element = source[i];
                        if (predicate(element) === true) {
                            return element;
                        }
                    }
                }
            },

            transform: function (source, transformer) {
                var result = [],
                    i, len, element;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        element = source[i];
                        result.push(transformer(element));
                    }
                }
                return result;
            },

            allAre: function (source, predicate) {
                var i, len, element;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        element = source[i];
                        if (predicate(element) !== true) {
                            return false;
                        }
                    }
                    return true;
                }
                throw new TypeError("source 不是一个合法的数组");
            },

            doForAll: function (source, closure) {
                var i, len;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        closure(source[i]);
                    }
                }
            },

            indexOf: _.indexOf,

             remove: function (source, desc) {
                if (angular.isArray(source)) {
                    var descIndex = this.indexOf(source, desc);
                    if (descIndex !== -1) {
                        source.splice(descIndex, 1);
                    }
                }
            },

            reduce: _.reduce,

            count: function (source, predicate) {
                var count = 0,
                    p = angular.isFunction(predicate) ? predicate : Predicates.newEqPredicate(predicate),
                    i, len;
                if (angular.isArray(source)) {
                    for (i = 0, len = source.length; i < len; i++) {
                        if (p(source[i]) === true) {
                            count ++;
                        }
                    }
                }
                return count;
            },

            /**
             * 判断对象是否是数组
             *
             * @public
             * @param object
             * @return {boolean} 是否数组
             */
            isNotArray: function (object) {
                return !angular.isArray(object);
            },

            isEmptyArray: function (array) {
                return angular.isArray(array) && array.length === 0;
            },

            isNotEmptyArray: function (array) {
                return !this.isEmptyArray(array);
            },


            /**
             * 如果不是一个数组， 包装成数组
             * @param source {Array/Object} 源对象
             */
            wrapIfNotArray: function (source) {
                return angular.isArray(source) ? source : [source];
            },

            /**
             * 将源数组按照分词器分组
             *
             * @param source {Array<Object>} 源数组
             * @param classifier {function(Object):(String|Number|Boolean) } 分词器， 传入每条记录， 根据返回的值分组
             */
            groupingBy: function (source, classifier) {
                var groupedSource = {},
                    key, groupedRecords;

                angular.forEach(source, function (record) {
                    key = classifier(record);
                    if (angular.isArray(groupedSource[key])) {
                        groupedRecords = groupedSource[key];
                    } else {
                        groupedRecords = groupedSource[key] = [];
                    }
                    groupedRecords.push(record);
                });
                return groupedSource;
            },

            /**
             * 将 `from` 中的元素 `copy` 到 `to` 中
             * @param from
             * @param to
             */
            pushAll: function (from, to) {
                var args = [to.length, 0].concat(from);
                arrayProto.splice.apply(to, args);
            },

            /**
             * 将 `from` 中的元素 `copy` 到 `to` 中的指定位置
             * @param from {Array}
             * @param to {Array}
             * @param position {Number}
             */
            into: function (from, to, position) {
                if (angular.isUndefined(position) || position === to.length){
                    this.pushAll(from, to);
                } else {
                    var args = [position, 0];
                    this.pushAll(from, args);
                    arrayProto.splice.apply(to, args);
                }
            },

            makeEmpty: function (source) {
                if (_.isArray(source)){
                    source.length = 0;
                }
            },
            /**
             * 将数组中的一个元素移动到另一个元素后面
             * @param source 起始数组
             * @param bEle 开始元素
             * @param eEle 目标元素
             */
            moveAfter:function(source,bEle,eEle){
                var index = 0,
                    length = source.length,
                    targetArray = [];
                for(;index < length ; index++){
                    if(source[index] != bEle){
                        targetArray.push(source[index]);
                    }
                    if(source[index] == eEle){
                        targetArray.push(bEle);
                    }
                }
                return targetArray;
            },

            moveBefore:function(source,bEle,eEle){
                var index = 0,
                    length = source.length,
                    targetArray = [];
                for(;index < length ; index++){
                    if(source[index] == eEle){
                        targetArray.push(bEle);
                    }
                    if(source[index] != bEle){
                        targetArray.push(source[index]);
                    }
                }
                return targetArray;
            }
        }
    };

});