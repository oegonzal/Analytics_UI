(function() {
    "use strict";
    
    var module = angular.module("networkRisk");
    
    module.component("lookupPage", {
        templateUrl: "/app/components/lookup/lookup.component.html",
        controllerAs: "vm",
        controller: ["cassandra",controller],
        bindings: {
            "$router": "<"
        }
    });

    function controller(cassandra) {
        var vm = this;

        vm.$routerOnActivate = function(next, previous) {    
            $('#test').html("Jquery works");
            $('#animation').animate({
                    opacity: 0.25,
                    left:    "+450",
                    height:  "toggle",
                }, 1000, function () {
                    $('#test').html("The animation is complete!");
                    $('#animation').css({display: "inline"});
                });
        };
    };

}());