(function () {

  angular
    .module('networkRisk')
    .factory('cassandra', cassandra);

    cassandra.$inject = ['$http'];
    function cassandra ($http) {

        var path = 'http://localhost:8443';

    	var deviceData = function(device,infra){
    		return $http.post(path + '/cass/check', {"device":device, "infra":infra});
        }

    	var listOfDevices = function(device_type,infra){
    		return $http.post(path + '/cass/deviceList', {"device_type":device_type, "infra":infra});
        }

        var deviceDataFromCRQ = function(device_ids){
            return $http.post(path + '/cass/CRQ', {"device_ids":device_ids});
        }

        var secondPageData = function(device_id){
            return $http.post(path + '/cass/secondPageData', {"device_id":device_id});
        }

        var detailedPageGraphData = function(device_id){
            return $http.post(path + '/cass/detailedPageGraphData', {"device_id":device_id});
        }
       
        var detailedPageTableData = function(device_id){
            return $http.post(path + '/cass/detailedPageTableData', {"device_id":device_id});
        }

         var tierApplicationData = function(device_id){
            console.log("---device_id: " + device_id);
            return $http.post(path + '/cass/tierApplicationInfo', { "device_id": device_id });
        }
        
        return {
            deviceData:deviceData,
            listOfDevices:listOfDevices,
            secondPageData:secondPageData,
            deviceDataFromCRQ:deviceDataFromCRQ,
            detailedPageGraphData:detailedPageGraphData,
            detailedPageTableData:detailedPageTableData,
            tierApplicationData:tierApplicationData
        };
    
}
})();