"use strict";

angular.module('trikatuka2').factory('Pagination', function () {
    function Pagination() {
        this.limit = 10;
        this.offset = 0;
        this.total = 0;
        this.pages = 0;
        this.currentPage = 0;
        //this.nextDisabled = true;
        //this.prevDisabled = true;
    };

    Pagination.prototype.updateTotal = function (total) {
        this.total = total;
        checkDisabled(this);
    };

    Pagination.prototype.getParams = function () {
        return {
            limit: this.limit,
            offset: this.offset
        }
    };

    Pagination.prototype.nextPage = function () {
        if (this.offset + this.limit < this.total) {
            this.offset += this.limit;
            pageChanged(this);
        }
    };

    Pagination.prototype.prevPage = function () {
        if (this.offset - this.limit >= 0) {
            this.offset -= this.limit;
            pageChanged(this);
        }
    };

    Pagination.prototype.setChangeCallback = function (callback) {
        this.changeCallback = callback;
    };

    function pageChanged(pagination){
        checkDisabled(pagination);
        if (pagination.changeCallback) {
            pagination.changeCallback(pagination.getParams());
        }
    }

    function checkDisabled(pagination) {
        if (pagination.total === 0) {
            pagination.nextDisabled = true;
            pagination.prevDisabled = true;
        }
        pagination.pages = Math.ceil(pagination.total / pagination.limit);
        pagination.currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

        if (pagination.offset - pagination.limit < 0) {
            pagination.prevDisabled = true;
        }
        else {
            pagination.prevDisabled = false;
        }

        if (pagination.offset + pagination.limit >= pagination.total) {
            pagination.nextDisabled = true;
        }
        else {
            pagination.nextDisabled = false;
        }
    }

    return Pagination;

});
