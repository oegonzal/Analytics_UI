(function () {

  angular
    .module('networkRisk')
    .factory('mssql', mssql);

    mssql.$inject = ['$http'];
    function mssql ($http) {
        
    	var crqData = function(crqnumber){
    		return $http.post('http://localhost:8443/mssql/crq', {"crqnumber":crqnumber});
        }

        var incidentData = function(deviceName){
            return $http.post('http://localhost:8443/mssql/deviceName', {"deviceName":deviceName});
        }

        return {
            crqData:crqData,
            incidentData:incidentData
        };
    }
})();