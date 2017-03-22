(function() {
    "use strict";
    
    var module = 

         angular.module("networkRisk", ["ngComponentRouter", "ngResource", "ngMaterial", "ngAnimate", "ui.grid", 'md.data.table'])
                .config(["$locationProvider", "$resourceProvider", config])
                .run([run])
                .value("$routerRootComponent", "originPage");

    function config($locationProvider, $resourceProvider){
        $locationProvider.html5Mode(true);
        $resourceProvider.defaults.stripTrailingSlashes = false;
    };

	function run() {

	};
    
}());