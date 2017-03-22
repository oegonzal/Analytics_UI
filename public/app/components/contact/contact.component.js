(function() {
    "use strict";
    
    var module = angular.module("networkRisk");
    
    function controller() {
        var vm = this;

        vm.$routerOnActivate = function(next, previous) {    
        };


    };
    
    module.component("contactPage", {
        templateUrl: "/app/components/contact/contact.component.html",
        controllerAs: "vm",
        controller: [controller],
        bindings: {
            "$router": "<"
        }
    })
}());