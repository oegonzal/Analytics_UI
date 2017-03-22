(function() {
    "use strict";
    
    var module = angular.module("networkRisk");

    module.component("basicPage", {
        templateUrl: "/app/components/basic/basic.component.html",
        controllerAs: "vm",
        controller: ["uiGridConstants", "mssql", controller],
        bindings: {
            "$router": "<"
        }
    });
    
    function controller(uiGridConstants, mssql) {
        var vm = this;

        vm.$routerOnActivate = function(next, previous) {
            vm.id = next.params.id;

            //table 1
            getIncidentDataFromViper(vm.id);

            vm.gridOptions = {
                enableColumnMenus: false,
                data : vm.myData,
                columnDefs: [
                          //{ field: 'Device', headerCellClass: 'device_table_header'},
                          { field: 'Priority-1' },
                          { field: 'Priority-2'},
                          { field: 'Priority-3'}
                      ]
                , enableHorizontalScrollbar : uiGridConstants.scrollbars.NEVER
                , enableVerticalScrollbar   : uiGridConstants.scrollbars.NEVER
            };
          
        };

        function getIncidentDataFromViper(deviceName){
            mssql.incidentData(deviceName).then(function(response){
                console.log("data from incidentData: " + JSON.stringify(response.data));

                var arr = response.data,
                    differentPriority = [],
                    values = [],
                    critical = 0,
                    high = 0,
                    low = 0,
                    medium = 0;

                console.log(response.data);
                for(var i=0;i<arr.length;i++){
                    var current = arr[i].Priority;
                    if(current == "High"){
                        high++;
                    }
                    else if(current == "Low")
                    {
                        low++;
                    }
                    else if(current == "Medium"){
                        medium++;
                    }
                    else if(current == "Critical"){
                        critical++;
                    } 
                }

                var values = [{
                    'Device': deviceName,
                    "Priority-1": high,
                    "Priority-2":medium,
                    "Priority-3":low
                }];

                vm.gridOptions.data = values;
                console.log("Viper Data values are: " + JSON.stringify(values));      
            });
                 
        };

    };

}());