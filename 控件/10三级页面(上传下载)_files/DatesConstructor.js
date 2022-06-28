/**
 * Created with IntelliJ IDEA.
 * User: zhengry
 * Date: 2014/11/17
 * Time: 13:55
 */
define(['angular'], function () {
    return function ($filter) {
        var dateFilter = $filter('date');
        return {
            /**
             * 获取当前时间的(YYYY-MM-DD HH:MI:SS) 字符格式 new Date -> YYYY-MM-DD HH:MI:SS
             */
            getCurrentDateTimeString: function () {
                return this.getDateTimeString(new Date());
            },
            /**
             * 获取当前时间的(YYYY-MM-DD) 字符格式 new Date -> YYYY-MM-DD
             * @param
             */
            getCurrentDateString: function (pattern) {
                return this.getDateString(new Date(), pattern);
            },
            /**
             * 获取当前时间的(YYYY-MM) 字符格式 new Date -> YYYY-MM
             */
            getCurrentYearAndMonthString: function () {
                return this.getYearAndMonthString(new Date());
            },
            /**
             * 日期对象转(YYYY-MM-DD HH:MI:SS) 字符格式 Date -> YYYY-MM-DD HH:MI:SS
             */
            getDateTimeString: function (date) {
                return dateFilter(date, 'yyyy-MM-dd HH:mm:ss')
            },
            /**
             * 日期对象转(YYYY-MM-DD) 字符格式 Date -> YYYY-MM-DD
             */
            getDateString: function (date, pattern) {
                return dateFilter(date, pattern || 'yyyy-MM-dd');
            },
            /**
             * 日期对象转(YYYY-MM) 字符格式 Date -> YYYY-MM
             */
            getYearAndMonthString: function (date) {
                return dateFilter(date, 'yyyy-MM');
            },
            /**
             * 日期字符转日期对象 YYYY-MM-DD -> Date
             */
            getDateByDateString: function (dateStr) {
                var regEx = new RegExp("\\-", "gi");
                dateStr = dateStr.replace(regEx, "/");
                var retDate = new Date(dateStr);
                return retDate;
            },
            /**
             * 截止日期 减 起始日期，返回剩余天数 (Date - Date) return days;
             */
            getSurplusDays: function (startDate, endDate) {
                return (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
            },
            /**
             * 根据指定(正负)天数,获取之前或之后的(YYYY-MM-DD)日期字符串
             */
            getBeforeOrAfterCurrentDateString: function (days) {
                var date = new Date();
                if (!days) {
                    days = 0;
                }
                date = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
                return this.getDateString(date);
            },
            /**
             * 获取时间戳流水号
             * @returns {*}
             */
            getCurrentDateTimeStamp: function () {
                var str = this.getCurrentDateTimeString();
                var reg = new RegExp("\\-", "gi");
                var regs = new RegExp("\\:", "gi");
                return str.replace(reg, "").replace(regs, "").replace(/[ ]/g, "");
            }
        }
    }
});