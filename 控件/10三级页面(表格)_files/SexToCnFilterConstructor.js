define('framework/filters/SexToCnFilterConstructor', function () {
    return function () {
        return function (val) {
            if (val) {
                var localGender = val.toLowerCase();
                if (localGender === 'male') {
                    return '男';
                } else if (localGender === 'female') {
                    return '女';
                }
            }
            return ''
        }
    }
});