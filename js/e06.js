console.log('TEST ONE');
var config = {
	url: 'json/data.json',
	dbApi: 'http://ec2-54-187-60-135.us-west-2.compute.amazonaws.com:3000/api/db/',
	study: '1'
};
var app = angular.module('Tox_App', []);
app.controller('Tox_Controller', function($scope, $http) {
	$http.get(config.dbApi + 'vol').success(function (response) {
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
				var toBeSent = {'device': $('#deviceInput').val(), 'action': 'search', 'study': '1', 'value': values, 'date': new Date().toISOString()};
				$scope.dbInsert('results', toBeSent);
			} else {
				alert('Please enter a device number');
			}
		});
		$(document).on('click', '.applyBtn', function(){
			$(this).toggleClass('btn-success');
		});
		$(document).on('click', '.clickeable', function(){
			var elems = this.id.split('-');
			var toBeSent = {'device': $('#deviceInput').val(), 'action': elems[0], 'study': config.study, 'value': elems[1], 'date': new Date().toISOString()};
			$scope.dbInsert('results', toBeSent);
		});
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