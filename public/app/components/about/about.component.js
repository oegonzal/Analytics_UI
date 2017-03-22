(function() {
    "use strict";
    
    var module = angular.module("networkRisk");
    
    function controller() {
        var vm = this;

        vm.$routerOnActivate = function(next, previous) {    
        };


    };
    
    module.component("aboutPage", {
        templateUrl: "/app/components/about/about.component.html",
        controllerAs: "vm",
        controller: [controller],
        bindings: {
            "$router": "<"
        }
    })
}());