define([
    "angular",
    "angular-resource"
], function (angular) {
    var HeaderModule = angular.module('HeaderModule', [])
    HeaderModule.controller('HeaderController', function ($scope, Resource,$rootScope,$timeout,$location) {
        var Course = Resource("/gschool/course");
        $scope.courses = [];
        var initHeaderChoose = function(){
            var courseId = $location.search()['courseId'];
            if (courseId) {
                angular.forEach($scope.courses,function(course){
                    if (course.id ==courseId) {
                        course.isOn = {
                            "on":true
                        }
                    }else{
                        course.isOn = {
                            "on":false
                        }
                    }
                });
                 $scope.isHome = {
                    "on":false
                 }
            }
        };
        Course.query({}, function (data) {
            $scope.courses = data;
            initHeaderChoose()
        });
        $scope.isHome = {
        	"on":true
        }

        /**
         * 跳转至某一课程
         * @param  {[type]} courseId [课程ID]
         */
        $scope.redirectToCourse = function (currentCourse,courses) {
        	angular.forEach(courses,function(course){
                if (course ==currentCourse) {
                    course.isOn = {
                        "on":true
                    }
                }else{
                    course.isOn = {
                        "on":false
                    }
                }
            });
        	 $scope.isHome = {
        	 	"on":false
        	 }
            window.location.href = "/html/course#/?courseId=" + currentCourse.id;
        };
        $scope.goHome = function(){
        	$scope.isHome = {
        		"on":true
        	}
        	window.location.href = "/html/course";
        };
        
        $rootScope.$on('$locationChangeSuccess',initHeaderChoose);
    });
});