define(["angular"], function (angular) {
    return {
        /**
         * [toDBC 半角转全角方法]
         * @param  {[type]} source [转换目标]
         * @return {[type]}        [转换结果]
         */
        toDBC: function (source) {


        },
        /**
         * [toCDB 全角转半角方法]
         * @param  {[type]} source [转换目标]
         * @return {[type]}        [转换结果]
         */
        toCDB: function (source) {
            var result = "",
                length = source.length,
                i;
            for (i = 0; i < length; i++) {
                if ((source.charCodeAt(i) > 65248 && source.charCodeAt(i) < 65375)) {
                    result += String.fromCharCode(source.charCodeAt(i) - 65248);
                } else {
                    result += String.fromCharCode(source.charCodeAt(i));
                }
            }
            source = source.replace("　", " ");
            return result;
        }
    }

});