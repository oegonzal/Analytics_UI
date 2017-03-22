(function() {
    "use strict";
    
    var module = angular
    .module("networkRisk")
    .component("landingPage", {
        templateUrl: "/app/components/landing/landing.component.html",
        controllerAs: "vm",
        controller: ["uiGridConstants","cassandra","mssql", "$interval",  "$timeout", controller],
        bindings: {
            "$router": "<"
        }
    });


    function controller(uiGridConstants, cassandra, mssql, $interval, $timeout) {
        var vm = this;
        vm.findCRQ=getInfoByCRQNumber;

        vm.$routerOnActivate = function(next, previous) {
            vm.show_table = false;
            vm.myData = [];
            vm.gridOptions = {};
            vm.disable = false;
            vm.determinateValue = 0;
        };

        vm.findDevices = function (){

            //Remove timer if response not returned
            vm.flag = true;
            $timeout(function(){
                if(vm.flag){
                    vm.disable = false;
                    vm.flag = false;
                }
                
            }, 15000);

            vm.disable = true;
            cassandra.listOfDevices(vm.device_type,vm.infra).then(function(data){
                vm.myData = data.data;
                vm.table_size = vm.myData.length;
                
                vm.gridOptions = {
                    enableSorting: true,
                    columnDefs: [
                      { 
                        field: 'Device',
                        cellTemplate: '<a style="margin-left: 5px;" href="/basic/{{row.entity.Device}}"> {{row.entity.Device}} </a>' 
                      },
                      { field: 'Crticality Score' },
                      { field: 'Volatility Score'}
                    ],
                    data: vm.myData
                  };
                
              styleTable( vm.table_size );
              vm.show_table = true;
              vm.disable = false;
              vm.flag = false;
            });
        }

        function getInfoByCRQNumber(number){
            if(typeof number == "undefined"){
                alert("Please enter a valid CRQ number.");
            }
            else if (number.length < 6){
                alert("Enter valid CRQ Number please.");
            }
            else{
                //Remove timer if response not returned
                vm.flag = true;
                $timeout(function(){
                    if(vm.flag){
                        vm.disable = false;
                        vm.flag = false;
                    }
                    
                }, 15000);

                if(number.length == 6){
                    number = "CRQ000000"+number;
                }
                vm.disable = true;
                mssql.crqData(number).then(function(response){
                    var values = response.data;

                    vm.dataByCRQ= response.data;
                    
                    if(values.length==0){
                        vm.gridOptions = {
                            enableSorting: true,
                            columnDefs: [
                              { 
                                field: 'Device',
                                cellTemplate: '<a style="margin-left: 5px;" href="/basic/{{row.entity.Device}}"> {{row.entity.Device}} </a>' 
                              },
                              { field: 'Crticality Score' },
                              { field: 'Volatility Score'}
                            ],
                            data: vm.myData
                          };
                        var size=-1;
                        styleTable(size);
                        vm.show_table = true;
                        vm.disable = false;
                        vm.flag = false;
                    }

                    for(var i = 0 ; i < values.length; i++){
                        var current = values[i],
                            servers = current.CHGHardwareCIList,
                            serverArr = servers.split(";");

                        vm.serverListFromCRQ = serverArr;
                        console.log(vm.serverListFromCRQ.length);
                        populateTableFromCRQ();               
                    }
                });
            }
        };

        function populateTableFromCRQ(){
            cassandra.deviceDataFromCRQ(vm.serverListFromCRQ).then(function(data){
            vm.myData = data.data;
            vm.table_size = vm.myData.length;
            
            vm.gridOptions = {
                enableSorting: true,
                columnDefs: [
                  { 
                    field: 'Device',
                    cellTemplate: '<a style="margin-left: 5px;" href="/basic/{{row.entity.Device}}"> {{row.entity.Device}} </a>' 
                  },
                  { field: 'Crticality Score' },
                  { field: 'Volatility Score'}
                ],
                data: vm.myData
              };
                
              styleTable( vm.table_size );
              vm.show_table = true;
              vm.disable = false;
            });
        };


        function styleTable(size){
            var message = angular.element(document.querySelector('#empty_table'));
            if(size == 0){
                vm.myStyle = {"display": "none"};
                message.html('<span style="color:red; font-size: 14px">There are no table entries. Please make a different selection.</span>');
            }
            else if(size == -1){
                vm.myStyle = {"display": "none"};
                message.html('<span style="color:red; font-size: 14px">Please check CRQ number and try again</span>');
            }

            else if( size <= 15 ){
                vm.myStyle = {"height": (size*30 + 30) + "px"};
                vm.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
                message.empty();
            }
            else {
                vm.myStyle = {"height": "480px"};
                vm.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
                message.empty();
            }
        }

        $interval(function() {
            vm.determinateValue += 5;
            if (vm.determinateValue > 100) {
              vm.determinateValue = 0;
            }
          }, 100);

    };
    
    
}());
