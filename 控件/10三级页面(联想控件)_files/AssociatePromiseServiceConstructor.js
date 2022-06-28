define('framework/service/AssociatePromiseServiceConstructor', ['angular', 'underscore'], function (angular, _) {
    var CONS = {
        ASS_PROMISE_PREFIXE: "ass_promise_"
    };

    var AssociatePromiseServiceConstructor = function ($q, $timeout) {
        this.deferreds = {};
        this.$q = $q;
        this.$timeout = $timeout;
    };
    var Proto = AssociatePromiseServiceConstructor.prototype;

    /**
     * @returns {String} promiseId;
     */
    Proto.register = function (groupId) {
        var me = this;
        var deferred = me.$q.defer();
        var promiseId = _.uniqueId(CONS.ASS_PROMISE_PREFIXE + groupId);
        if (me.deferreds[promiseId]) me.deferreds[promiseId].resolve(true);
        me.deferreds[promiseId] = deferred;
        console.log('AssociatePromiseService.register(', promiseId, ')')
        deferred.promise.then(function () {
            console.log('AssociatePromiseService.then(', promiseId, ')')
        })
        return promiseId;
    };

    Proto.resolve = function (promiseId) {
        console.log('AssociatePromiseService.resolve(', promiseId, ')');
        if (this.deferreds[promiseId])
            this.deferreds[promiseId].resolve(true);
        delete this.deferreds[promiseId];
    };

    Proto.reject = function (promiseId, reason) {
        console.log('AssociatePromiseService.reject(', promiseId, ')')
        this.deferreds[promiseId].reject(reason);
    };

    Proto.callback = function (callback) {
        var me = this;
        var deferreds = me.deferreds;
        var promiseIds = _.keys(deferreds);
        var promises = _.chain(deferreds).values().map(_.property('promise'));
        console.log(_.map(promises, _.property('then')));
        me.$q.all(promises).then(function () {
            console.log('AssociatePromiseService.callback(', promiseIds, ')')
            callback();
            _.each(promiseIds, function (promiseId) {
                delete deferreds[promiseId];
            });            
        });
    };


    var svr = void 0;
    return function ($q, $timeout) {
        if (angular.isUndefined(svr)) {
            svr = new AssociatePromiseServiceConstructor($q, $timeout);
        }
        return svr;
    };
});