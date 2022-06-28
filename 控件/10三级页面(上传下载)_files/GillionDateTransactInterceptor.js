define("framework/interceptors/GillionDateTransactInterceptor",['angular'],function(angular) {
    return  function($q){
        return {
            'request': function(config) {
                var _params,ele;
                _params = config.params;
                if(_params){
                    for(ele in _params){
                        if(angular.isDate(_params[ele])){
                            _params[ele] = _params[ele].toISOString();
                        }
                    }
                }
                config.params=_params;
                return config;
            }
        }
    }
});


