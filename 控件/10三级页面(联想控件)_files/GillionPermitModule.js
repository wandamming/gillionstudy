define('framework/permit/GillionPermitModule', ['angular'], function (angular) {
    return angular.module('GillionPermitModule', [])
        .factory('Permissions', ['$rootScope', '$http', 'Arrays', function ($rootScope, $http, Arrays) {
            var pathname = window.location.pathname,
                pageUrl = pathname;
            if (pathname.indexOf(pathname) === 0) {
                pageUrl = pathname.substr(window.ctx.length);
            }

            function Permissions() {
                var sessionAttrsAndNoPermits = window.sessionAttrsAndNoPermits;
                var me = this;
                if (sessionAttrsAndNoPermits) {
                    this.loadSessionAttrsAndNoPermits(sessionAttrsAndNoPermits);
                } else {
                    angular.element(document).on('sessionAttrsAndNoPermitsLoaded', function() {
                        angular.element(document).off('sessionAttrsAndNoPermitsLoaded');
                        me.loadSessionAttrsAndNoPermits(window.sessionAttrsAndNoPermits);
                    });
                }
            }

            Permissions.prototype.loadSessionAttrsAndNoPermits = function(data) {
                $rootScope.$sessionAttrs = data.sessionAttrs;
                this.setNoPermits(data.noPermits);
                this.loaded = true;
                if(window.document.documentMode === 8) window.sessionAttrsAndNoPermits = undefined;
                else delete window.sessionAttrsAndNoPermits;
            };

            Permissions.prototype.reload = function () {
                var me = this;
                $http.get(window.basePath + '/system/security/getSessionAttrsAndNoPermits', {params: {pageUrl: pageUrl}})
                    .success(function(result) {
                        if (result.redirectUrl) {
                            // 未登录， 重定向，
                            // FIXME 如果用nginx， 注意更改 `window.ctx`
                            window.location.href = window.ctx + result.redirectUrl;
                        } else {
                            $rootScope.$sessionAttrs = result.sessionAttrs;
                            me.setNoPermits(result.noPermits);
                            me.loaded = true;
                        }
                    });
            };

            Permissions.prototype.setNoPermits = function (noPermits) {
                this.noPermits = noPermits;
                $rootScope.$broadcast('validPermit', this.noPermits || []);
            };

            Permissions.prototype.noPermit = function (resourceUrl) {
                return Arrays.exists(this.noPermits, resourceUrl);
            };

            return new Permissions();
        }]).directive('gPer', function (Permissions) {
            return {
                scope: false,
                restrict: 'A',
                link: function (scope, element, attributes) {
                    var resourceUrl = attributes.gPer || attributes.href,
                        noPer = attributes.noPer,
                        noPerToken, noPerCallback;
                    if (angular.isString(noPer)) {
                        noPerToken = noPer.match(/^(\w+)\(\)$/);
                        if (noPerToken) {
                            noPerCallback = scope[noPerToken[1]];
                        }
                    }
                    if (resourceUrl) {
                        if (Permissions.loaded === true) {
                            doDirective();
                        }
                        scope.$on('validPermit', doDirective);
                    }
                    function doDirective() {
                        if (Permissions.noPermit(resourceUrl)) {
                            if (angular.isFunction(noPerCallback)) {
                                noPerCallback(element);
                            } else if (noPer === 'disabled') {
                                element.attr('disabled', 'disabled');
                            } else {
                                return;
                            }
                        }
                        element.removeAttr('g-per');
                    }
                }
            }
        });
});
