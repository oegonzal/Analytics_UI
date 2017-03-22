(function() {
    "use strict";
    
    var module = angular.module("networkRisk");
    
    module.component("originPage", {
        template:   '<ng-outlet></ng-outlet>',
        $routeConfig: [
            { path: "/",                    component: "landingPage",           name: "Landing"                            },
            { path: "/crq",                 component: "crqPage",               name: "Crq"                                },
            { path: "/basic/:id",           component: "basicPage",             name: "Basic"                              },
            { path: "/detailed/:id",        component: "detailedPage",          name: "Detailed"                           },
            { path: "/lookup",              component: "lookupPage",            name: "Lookup"                             },
            { path: "/about",               component: "aboutPage",             name: "About"                              },
            { path: "/contact",             component: "contactPage",           name: "Contact"                            },

            
            { path: "/**",                                                                  redirectTo: ["Landing"]        }
        ]
    });
}());

//https://github.com/angular-ui/ui-router/issues/2793