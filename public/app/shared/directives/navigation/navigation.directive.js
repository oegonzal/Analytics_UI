(function () {

  angular
    .module('networkRisk')
    .directive('navigation', navigation);

  function navigation () {
    return {
      restrict: 'EA',
      templateUrl: '/app/shared/directives/navigation/navigation.template.html',
      controller: 'navigationCtrl as navvm'
    };
  }

})();