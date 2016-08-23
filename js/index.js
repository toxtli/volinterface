console.log('TEST ONE');
var config = {
	url: 'json/data.json',
	remoteUrl: 'http://localhost:3000/api/db/vol?active=1'
};
var app = angular.module('Tox_App', []);
app.controller('Tox_Controller', function($scope, $http) {
	$http.get(config.remoteUrl).success(function (response) {
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
		$(document).on('click', '.applyBtn', function(){
			$(this).toggleClass('btn-success');
			/*
			$.ajax({
			    url : "http://localhost:3000/api/db/results?age=45",
			    type: "PUT",
			    data: {name:"Carlos"},
			    success: function(data, textStatus, jqXHR) {
			        console.log(data);
			    }
			});
			*/
		});
	});
});