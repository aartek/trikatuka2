"use strict";

angular.module('trikatuka2').factory('User', function (mySocket, Spotify, $sessionStorage, $rootScope, $http, $q) {
    function User(id, authData) {
        this.authData = authData;
        this.data = null;
        this.id = id;

        if(authData && !authData.error){
            this.fetchData();
        }
    }

    User.prototype.login = function(){
        var self = this;
        var signingProccessId = guid().toString();

        mySocket.on('user_logged_in', function (data) {
            if (signingProccessId === data.signingProccessId) {
                self.authData = data;
                self.authData.expiresAt = new Date().getTime() + (self.authData.expires_in * 1000);
                self.fetchData().then(function(){
                    $sessionStorage[self.id] = self.authData;
                    self.loggedIn = true;
                    $rootScope.$broadcast('USER_LOGGED_IN', self);
                });
            }
        });

        var wnd =  window.open('', '', "width=800, height=600, scrollbars=yes");
        mySocket.emit('login', signingProccessId, function (url) {
            wnd.location.href=url;
        });
    };

    User.prototype.fetchData = function(){
        var self = this;
        return Spotify.get('https://api.spotify.com/v1/me', self).then(function (response) {
            self.data = response.data;
        });
    };

    User.prototype.logout = function(){
        delete $sessionStorage[this.id];
        this.authData = null;
        this.data = null;
        $rootScope.$broadcast('USER_LOGGED_OUT', this);
    };

    User.prototype.getAccessToken = function () {
        return this.authData.access_token;
    };

    User.prototype.getUserId = function () {
        return this.data.id;
    };

    User.prototype.refreshToken = function () {
        var self = this;
        var deferred = $q.defer();

        mySocket.emit('refreshToken', self.authData.refresh_token, function(response){
            self.authData = response;
            self.authData.expiresAt = new Date().getTime() + (self.authData.expires_in * 1000);
            $sessionStorage[self.id] = self.authData;
            deferred.resolve(self);
        });

        return deferred.promise;
    };

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + + s4() +  s4() +  +
            s4() + + s4() + s4() + s4();
    }

    return User;
});
//# sourceURL=User.js
