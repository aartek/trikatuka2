"use strict";

app.factory('Checkboxes', function () {

    function Checkboxes(cache) {
        this.cache = cache || {};
        this.checkboxes = {};
    }

    Checkboxes.prototype.removeCheckboxes = function () {
        this.checkboxes = {};
    };

    Checkboxes.prototype.clearCache = function () {
        this.cache = {};
        uncheckAll(this);
        this.selectAll = false;
    };

    Checkboxes.prototype.add = function (obj) {
        this.checkboxes[obj.id] = obj;
        if(this.cache[obj.id]){
            obj.check();
        }
    };

    Checkboxes.prototype.check = function (id, value) {
        this.cache[id] = value;
    };
    Checkboxes.prototype.uncheck = function (id) {
        delete this.cache[id];
    };

    Checkboxes.prototype.getSize = function(){
        return _.size(this.cache);
    };

    Checkboxes.prototype.toggleCheck = function(){
        if(this.selectAll){
            checkAll(this);
        }
        else{
            uncheckAll(this);
        }
    };

    Checkboxes.prototype.pageSwitch = function(){
        this.removeCheckboxes();
        this.selectAll = false;
    };

    function checkAll(pagination){
        _.each(pagination.checkboxes, function(checkbox){
            checkbox.check();
        });
    }

    function uncheckAll(pagination){
        _.each(pagination.checkboxes, function(checkbox){
            checkbox.uncheck();
        });
    }

    return Checkboxes;
});

app.directive('checkbox', function () {
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