(function() {
    "use strict";
    
    var module = angular.module("networkRisk");

    module.component("detailedPage", {
        templateUrl: "/app/components/detailed/detailed.component.html",
        controllerAs: "vm",
        controller: ['uiGridConstants',"cassandra","mssql", "$scope", "$timeout", controller],
        bindings: {
            "$router": "<"
        }
    });
    
    function controller(uiGridConstants, cassandra, mssql, $scope, $timeout) {
        var vm = this;
        vm.show_applications = false;
        initTierTables( {"Tier-RT": [], 'Tier-0': [], 'Tier-1': [], 'Tier-2 and Above': [], 'Groups': []} );

        vm.$routerOnActivate = function(next, previous) {
            vm.id = next.params.id;

            getIncidentDataFromViper();
            populateDetailedGraphTables();
            getTierInformation();

            vm.gridOptions = {
                enableColumnMenus: false,
                columnDefs: [
                  { field: 'Tier-RT', type: 'number' },
                  { field: 'Tier-0', type: 'number' },
                  { field: 'Tier-1', type: 'number' },
                  { field: 'Tier-Above 1', type: 'number'}
                  
                ],
                data : []
                , enableHorizontalScrollbar : uiGridConstants.scrollbars.NEVER
                , enableVerticalScrollbar   : uiGridConstants.scrollbars.NEVER
            };
            

            vm.gridOptions2 = {
                enableSorting: true,
                gridMenuShowHideColumns: false,
                columnDefs: [
                  { field: 'Incident', enableColumnMenu: false },
                  { field: 'Priority', enableColumnMenu: false },
                  { field: 'MTTR', enableColumnMenu: false, type: 'number' }
                ],
                data: []
              };
            
        };

        vm.getApplications = function() {
            vm.show_applications = (vm.show_applications) ? false : true;
        };

        function styleTable(size){
            if( size <= 8 ){
                vm.myStyle = {"height": (size*30 + 31) + "px", "width": "100%"};
                vm.gridOptions2.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
                vm.gridOptions2.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
            }
            else {
                vm.myStyle = {"height": "271px", "width": "100%"};
                vm.gridOptions2.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
                vm.gridOptions2.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
            }
        };

        function populateDetailedGraphTables(){
            cassandra.detailedPageTableData(vm.id).then(function(response){
               vm.gridOptions.data = response.data;
               styleTable(response.data.length);

               if(response.data.length == 0){
                    angular.element(document.querySelector('#CAMR_msg')).html("No data available");
                }
            });
        };

        function getIncidentDataFromViper(){
            var deviceName = vm.id;

            mssql.incidentData(deviceName).then(function(response){
                vm.gridOptions2.data = response.data;
                styleTable(response.data.length); 

                if(response.data.length == 0){
                    angular.element(document.querySelector('#viper_detailed_msg')).html("No data available");
                }
            });

        };

        function initTierTables(tier_data) {
            vm.tier_RT_options = getTierOptions('Tier-RT', tier_data['Tier-RT']);
            vm.tier_0_options = getTierOptions('Tier-0', tier_data['Tier-0']);
            vm.tier_1_options = getTierOptions('Tier-1', tier_data['Tier-1']);
            vm.tier_2_above_options = getTierOptions('Tier-2 and Above', tier_data['Tier-2+']);
            vm.groups_options = getTierOptions('Groups', tier_data['Groups']);

            vm.tier_tables = {
                'Tier-RT': vm.tier_RT_options,
                'Tier-0': vm.tier_0_options,
                'Tier-1': vm.tier_1_options,
                'Tier-2 And Above': vm.tier_2_above_options,
                'Groups': vm.groups_options
            }
        };
                
        function getTierOptions(tier_id, data_array){
            var col_name = (tier_id == 'Groups') ? 'group' : 'app_name';
            return  {
                        enableColumnMenus: false,
                        columnDefs: [{ field: col_name, width: "100%" }],
                        data : data_array
                        , enableHorizontalScrollbar : uiGridConstants.scrollbars.NEVER
                    };
        };

        function getTierInformation(){
            cassandra.tierApplicationData(vm.id).then( function(response){
                var tier_data = response.data;

                vm.tier_RT_options.data         = tier_data['Tier-RT'];
                vm.tier_0_options.data          = tier_data['Tier-0'];
                vm.tier_1_options.data          = tier_data['Tier-1'];
                vm.tier_2_above_options.data    = tier_data['Tier-2+'];
                vm.groups_options.data          = tier_data['GroupingInfo'];
                
                if(isEmpty(tier_data)){
                    for (var i=0;i<5;i++){
                        angular.element(document.querySelector('#tier_table_'+i)).html("No data available");
                    
                    
                }
                }
                else{
                    var i=0;
                    
                    for (var k in tier_data){
                    
                        if(tier_data[k].length == 0 ){
                            angular.element(document.querySelector('#tier_table_'+i)).html("No data available");
                        }
                        i++;
                    }
                }

            });


        };
        function isEmpty(obj) {
                    for(var prop in obj) {
                        if(obj.hasOwnProperty(prop))
                            return false;
                    }

                    return true && JSON.stringify(obj) === JSON.stringify({});
                }
    };

})();