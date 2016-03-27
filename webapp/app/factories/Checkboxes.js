"use strict";

angular.module('trikatuka2').factory('Checkboxes', function () {

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