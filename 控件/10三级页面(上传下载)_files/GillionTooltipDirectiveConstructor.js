define('framework/tooltip/GillionTooltipDirectiveConstructor',['angular'], function (angular) {
    return function ($compile,GillionTooltipService,GillionLocationService) {
        return {
            scope:{
                className:'@',
                gTooltip:'@',
                direction:'@',
                outterBox:'@',
                hideEvent:'@',
                showEvent:'@',
                isShow:'=',
                tipContent:'=',
                onBeforeHide:'&',
                onBeforeShow:'&'
            },
            restrict: 'A',
            link: function (scope, element,attrs) {
                var params = {
                    'gTooltip':scope.gTooltip,
                    'direction':scope.direction,
                    'outterBox':scope.outterBox,
                    'className':scope.className,
                    'tipBoxDefaultEvent':attrs.isShow?false:true

                };
                if(attrs.messageType=='tip'){
                    params.fontColor="#00b7ee";
                    params.iconColor="#00b7ee";
                    params.iconType = 'fi-help';
                }else if(attrs.messageType=='warn'){
                    params.fontColor="#E0600B";
                    params.iconColor="#f06e00";
                    params.iconType = 'fi-error';
                }
                var messages = GillionTooltipService.create(element,params);
                //messages.createMessageDom();
                //messages.hide();
                scope.showEvent = !!scope.showEvent?scope.showEvent:"mouseenter";
                scope.hideEvent = !!scope.hideEvent?scope.hideEvent:"mouseleave";
                element.on(scope.showEvent,function(){
                    if(attrs.onBeforeShow){
                        if(scope.onBeforeShow()===false){
                            return;
                        }
                    }
                    messages.createMessageDom();
                });
                element.on(scope.hideEvent,function(){
                    if(attrs.onBeforeHide){
                        if(scope.onBeforeHide()===false){
                            return;
                        }
                    }
                    messages.remove();
                });

                if(attrs.tipContent){
                    scope.$watch("tipContent",function(newVal){
                        if(newVal){
                            params.gTooltip = newVal;
                            messages = GillionTooltipService.create(element,params);
                            if(scope.isShow){
                                messages.createMessageDom();
                            }
                        }else{
                            params.gTooltip = scope.gTooltip;
                            messages = GillionTooltipService.create(element,params);
                        }
                    })
                }

                if(attrs.isShow){
                    scope.$watch("isShow",function(newVal){
                        if(newVal){
                            messages.createMessageDom();
                        }else{
                            messages.remove();
                        }
                    })
                }
                GillionLocationService.calculateLocation(element);
                //element.next().on("mouseenter",function(){ messages.show()});
                //element.next().on("mouseleave",function(){ messages.remove()});
            }
        }
    }
});