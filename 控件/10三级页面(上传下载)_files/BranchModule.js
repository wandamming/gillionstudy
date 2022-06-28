define([
	"angular",
	"angular-route",
	"system/core/HeaderModule"
	],function(angular){
	var BranchModule = angular.module('BranchModule', ["ngRoute","HeaderModule"]),
		stageDefaultPage={
			"3":"widget/textArea/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=3",
			"5":"widget/star/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=5",
			"7":"widget/dictionary/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=7",
			"8":"widget/toolTip/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=8",
			"9":"widget/dropdown/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=9",
			"10":"widget/datasource/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=10",
			"11":"widget/listBox/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=11",
			"13":"widget/tree/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=13",
			"15":"widget/date/instructions?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=15",
			"16":"widget/clickbox/instructions?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=16",
			"17":"widget/time/instructions?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=17",
			"18":"widget/associate/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=18",
			"21":"widget/areas/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=21",
			"22":"widget/numberspinner/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=22",
			"27":"widget/combotree/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=27",
			"1":"widget/window/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=1",
			"19":"widget/slider/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=19",
			"20":"widget/groupgrid/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=20",
			"2":"widget/textField/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=2",
			"23":"widget/tab/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=23",
			"24":"widget/pagination/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=24",
			"26":"widget/dropdownbtn/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=26",
			"28":"widget/tabindex/g-tabindex?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=28",
			"29":"widget/dataGrid/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=29",
			"30":"widget/textsearch/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=30",
			"31":"widget/multilist/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=31",
			"32":"widget/upload/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=32",
			"33":"widget/download/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=33",
			"34":"widget/exportexcel/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=34",
			"35":"widget/importexcel/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=35",
			"36":"widget/validator/method?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=36",
			"37":"widget/pauseclick/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=37",
			"234":"widget/drag/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=234",
			"100":"widget/pemission/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=100",
			"122":"widget/dataPermition/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=122",
			"108":"widget/cache/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=108",
			"290":"widget/faq/noSubmit?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=290",
			"221":"widget/resCache/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=221",
			"291":"widget/faq/inc?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=291",
			"38":"widget/describe/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=38",
			"101":"gesb/describe/function?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=101",
			"102":"gesb/safe/appkey?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=102",
			"103":"gesb/protocol/http?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=103",
			"104":"gesb/component/http?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=104",
			"105":"gesb/changer/function?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=105",
			"106":"gesb/Scene_application/sign?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=106",
			"107":"gesb/video/EDS?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=107",
			"292":"widget/faq/saveorupdate2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=292",
			"293":"widget/faq/Maven2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=293",
			"294":"widget/faq/qianduan2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=294",
			"295":"widget/faq/DataGrid2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=295",
			"296":"widget/faq/DataGridPL2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=296",
			"297":"widget/faq/ValidationFAQ2?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=297",
			"4":"widget/unitTextfield/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=4",
			"201":"edsClient/settings/rpc?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=201",
			"123":"widget/EC/video?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=123",
			"50":"widget/hotTable/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=50",
			"109":"gesb/manager/function?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=109",
			"202":"edsClient/code/function?courseId=fbfa91d8-c834-4715-a94d-3082334ffd4e&stageId=202",
			"55":"widget/listView/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=55",
			"433":"widget/api/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=433",
			"56":"widget/fluidView/function?courseId=2e8c206d-8f6b-4661-b7c2-5f080a7f865b&stageId=56"

		};
	BranchModule.controller('BranchStageTreeController',function ($scope,Resource,$location) {
		var BranchStage = Resource("/gschool/stageChapter/:stageId",{stageId:"@stageId"});
		var stageId = $location.search()['stageId'];
		$scope.currentStageId = $location.search()['stageId'];
		$scope.currentCourseId = $location.search()['courseId'];
		BranchStage.query({stageId:stageId},function(data){
			$scope.branchStages = data;
			if(data && data.length && $location.$$path == "/"){
				var url = $location.$$absUrl.substr(0,$location.$$absUrl.length-$location.$$url.length);
			}
		});
	});
	//设置显示内容
	BranchModule.config(function ($routeProvider) {
		//$location = angular.injector(["ng"]).get("$location");
		//var stageId = $location.search()['stageId']
		$routeProvider.when('/:route', {
			templateUrl: function(attr){
				$location = angular.element(document).injector().get("$location");
				var stageId = $location.search()['stageId']
				return "contents/"+attr.route+"?stageId="+stageId;
			}
		}).when("/",{
			templateUrl: function(attr){
				$location = angular.element(document).injector().get("$location");
				var stageId = $location.search()['stageId']
				return "contents/content1?stageId="+stageId;
			}
		}).when("/",{
			templateUrl: function(attr){
				$location = angular.element(document).injector().get("$location");
				var stageId = $location.search()['stageId'];
				if(stageId){
					return "contents/"+stageDefaultPage[stageId];
				}
				//if(courseId){
				//	return "contents/"+courseDefaultPage[courseId];
				//}
				return "contents/"+attr.course+"/"+attr.branch+"/"+attr.chapter+"?stageId="+stageId;
			}
		}).when("/:course/:branch/:chapter",{
			templateUrl: function(attr){
				$location = angular.element(document).injector().get("$location");
				var stageId = $location.search()['stageId']
				return "contents/"+attr.course+"/"+attr.branch+"/"+attr.chapter+"?stageId="+stageId;
			}
		});
	});
});