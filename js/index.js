console.log('TEST ONE');
var config = {url: 'json/data.json'};
var app = angular.module('Tox_App', []);
app.controller('Tox_Controller', function($scope, $http) {
	$http.get(config.url).success(function (response) {
		$scope.data = response;
		$scope.results = [];
		var db = TAFFY(response);
		$scope.jobs = db().distinct("job");
		var firstJob = $scope.jobs[0];
		$scope.skills = db({job:firstJob}).distinct("skill");
		$('#jobSelect').change(function(){
			$scope.skills = db({job:this.value}).distinct("skill");
			$scope.$apply();
		});
		$('#searchButton').click(function(){
			var values = $('#skillSelect').val();
			console.log(values);
			$scope.results = db({skill:values}).get();
			console.log($scope.results);
			$scope.$apply();
		});
	});
});