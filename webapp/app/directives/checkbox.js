"use strict";

angular.module('trikatuka2').directive('checkbox', function () {
    return {
        restrict: 'E',
        scope: {
            checkboxes: '=',
            uid: '=',
            model: '='
        },
        template: '<input type="checkbox" ng-model="checked" ng-change="changed()" ng-disabled="viewDisabled"/>',
        replace: true,
        link: function (scope, elem, attrs) {

            scope.checkboxes.add({
                id: scope.uid,
                check: check,
                uncheck: uncheck
            });

            function changed() {
                if (scope.checked) {
                    scope.checkboxes.check(scope.uid, scope.model);
                }
                else {
                    scope.checkboxes.uncheck(scope.uid);
                }
            };
            scope.changed = changed;

            function check() {
                scope.checked = true;
                changed();
            }

            function uncheck() {
                scope.checked = false;
                changed();
            }

            scope.$on('DISABLE_VIEW', function(){
                scope.viewDisabled = true;
            });

            scope.$on('ENABLE_VIEW', function(){
                scope.viewDisabled = false;
            });

        }
    }
});
