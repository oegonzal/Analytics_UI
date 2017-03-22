(function () {

  angular
    .module('networkRisk')
    .factory('pageZero', pageZero);

    pageZero.$inject = ['$http'];
    function pageZero ($http) {

        var path = 'http://localhost:8443';

    	var crqData = function(device,infra){
    		return $http.post(path + '/zero/getCrqScore');
        }

        
        return {
            crqData:crqData,
        };
    
}
})();