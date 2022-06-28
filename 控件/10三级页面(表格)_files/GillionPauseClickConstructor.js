define('framework/control/GillionPauseClickConstructor',['angular','config.properties'],function (angular,config) {
    return function ($timeout) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var gPauseClick,pause;
                gPauseClick = $attrs.gPauseClick;
                if(!$attrs.gPauseClick){
                    if(config.controls.pauseClick && config.controls.pauseClick.pauseTime){
                        gPauseClick = config.controls.pauseClick.pauseTime;
                    }else{
                        gPauseClick = 5000;
                    }
                }
                pause = parseInt(gPauseClick);
                $element.on("click",function(){
                    $element[0].disabled=true;
                    $element.attr("disabled","disabled");
                    $timeout(function(){
                        $element[0].disabled=false;
                        $element.removeAttr("disabled");
                    },pause);
                });
            }
        }
    }
});