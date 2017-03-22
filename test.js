(function(){
	angular.module("WhiteBoardApp",[]);

	angular
	.module("WhiteBoardApp")
	.controller("HelloWorldController",HelloWorldController);

	function HelloWorldController($scope)
	{

		$scope.hello="Hello Chinmayee";
		$scope.courseName="java 101";

		$scope.user = {
			fName:"Alice",
			lname:"Wonderland"

		};

		var course ={title: "C# 100", seats:25, starts:new Date()};

		var courses = [
			course,
			{title:"PHP 101", seats:14, starts:new Date(2015,9,12)},
			{title:"node 101", seats:4, starts:new Date(2015,9,15)}
		];

		$scope.courses =courses;
		console.log("Hello World");


		$scope.removeCourse =function(course){
			console.log(course);
			var index = $scope.courses.indexOf(course);
			console.log(index);
			$scope.courses.splice(index,1);
		}
	}
})();