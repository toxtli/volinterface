console.log('TEST ONE');
var config = {
	url: 'json/data.json',
	dbApi: 'http://learntier.ga:3000/api/db/',
};
var app = angular.module('Tox_App', []);
app.controller('Tox_Controller', function($scope, $http) {
	$http.get(config.dbApi + 'vol?active=1&selected=1').success(function (response) {
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
			if ($('#deviceInput').val()) {
				var values = $('#skillSelect').val();
				console.log(values);
				$scope.results = db({skill:values}).get();
				console.log($scope.results);
				$scope.$apply();
				var toBeSent = {'device': $('#deviceInput').val(), 'action': 'search', 'study': '1', 'value': values};
				$scope.dbInsert('results', toBeSent);
			} else {
				alert('Please enter a device number');
			}
		});
		$(document).on('click', '.applyBtn', function(){
			$(this).toggleClass('btn-success');
			var toBeSent = {'device': $('#deviceInput').val(), 'action': 'apply', 'study': '1', 'value': this.id.split('-')[1]};
			$scope.dbInsert('results', toBeSent);
		});
		$scope.dbInsert = function(table, dataObj) {
			$.ajax({
		    	url : config.dbApi + table,
			    type: "POST",
			    data: dataObj,
			    success: function(data, textStatus, jqXHR) {
			        console.log(data);
				}
			});
		};
	});
});