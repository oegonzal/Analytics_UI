(function () {

  angular
    .module('networkRisk')
    .directive('visaFooter', navigation);

  function navigation () {
    return {
      restrict: 'EA',
      templateUrl: '/app/shared/directives/footer/footer.template.html'
    };
  }

})();