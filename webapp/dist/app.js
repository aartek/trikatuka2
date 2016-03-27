var app = angular.module('trikatuka2', ['ngRoute', 'ngResource', 'btford.socket-io', 'ngStorage']);

angular.module('trikatuka2').config(function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'MainCtrl as  mainVM',
        templateUrl: 'partials/main.html'
    }).otherwise({
        redirectTo: '/'
    });
});

angular.module('trikatuka2').run(function ($sessionStorage, users, User) {
    users.user1 = new User('user1', $sessionStorage.user1);
    users.user2 = new User('user2', $sessionStorage.user2);
});
//# sourceURL=app.js


"use strict";

angular.module('trikatuka2').controller('LoginCtrl', function ($scope, users) {
    $scope.user1 = users.user1;
    $scope.user2 = users.user2;

    $scope.$on('DISABLE_VIEW', function(){
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function(){
        $scope.viewDisabled = false;
    });
});
//# sourceURL=LoginCtrl.js

"use strict";

angular.module('trikatuka2').controller('MainCtrl', function ($scope, users){
    var self = this;
    self.viewDisabled = false;
    self.user1 = users.user1;
    self.user2 = users.user2;

    $scope.$on('DISABLE_VIEW', function () {
        self.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        self.viewDisabled = false;
    });
});
//# sourceURL=MainCtrl.js
"use strict";

angular.module('trikatuka2').controller('PlaylistListCtrl', function ($scope, $resource, users, Spotify, Pagination, Checkboxes, PlaylistService, Playlist, $rootScope, $q) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    var checkboxes = $scope.checkboxes = new Checkboxes();

    function loadPlaylists(params){
        return PlaylistService.loadPlaylists(users.user1, params, transformer);
    }

    function load() {
        loadPlaylists(pagination.getParams()).then(function (playlists) {
            checkboxes.pageSwitch();
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        });
    }

    load();

    function transformer(item) {
        return new Playlist(item, users.user1);
    }

    $scope.transferAll = function(){
        var confirmed = confirm('Are you sure you want to transfer all playlists?');
        if(!confirmed){
            return;
        }
        var playlists = [];
        var collectingPlaylistsPromises = [];

        var pages = Math.ceil(pagination.total / 50);
        for (var i = 0; i<pages; i++){
            collectingPlaylistsPromises.push(loadPlaylists({limit: 50, offset: i * 50}).then(function(result){
                playlists = playlists.concat(result.items);
            }));
        }

        $q.all(collectingPlaylistsPromises).then(function(){
            transfer(playlists);
        });
    };

    $scope.transferSelected = function () {
        var confirmed = confirm('Are you sure you want to transfer selected playlists?');
        if(!confirmed){
            return;
        }
        var items = checkboxes.cache;
        transfer(items);
    };

    function transfer(items){
        $rootScope.$broadcast('DISABLE_VIEW');
        var promises = [];

        _.each(items, function (item) {
            promises.push(item.transfer(users.user2));
        });

        $q.all(promises).then(function (results) {
            var successNames = _.chain(results).filter(function (item) {
                return item.success;
            }).map(function (item) {
                return item.playlist.name
            }).value();

            var failedNames = _.chain(results).filter(function (item) {
                return !item.success;
            }).map(function (item) {
                return item.playlist.name
            }).value();

            var msg = '';
            if(successNames.length) {
                msg += sprintf('Successfully transfered playlist(s):\n%s\n\n', successNames.join(',\n'));
            }
            if(failedNames.length) {
                msg += sprintf('Failed to transfer playlist(s):\n%s', failedNames.join(',\n'));
            }
            alert(msg);

            $rootScope.$broadcast('ENABLE_VIEW');
            checkboxes.clearCache();
        });
    }

    if (users.user1.authData) {
        load();
    }

    $scope.$on('USER_LOGGED_IN', function (event, user) {
        if (user.id === 'user1') {
            load();
        }
    });

    $scope.$on('USER_LOGGED_OUT', function (event, user) {
        if (user.id === 'user1') {
            $scope.items = null;
            pagination.updateTotal(0);
            checkboxes.clearCache();
            checkboxes.removeCheckboxes()
        }
    });

    $scope.$on('DISABLE_VIEW', function () {
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        $scope.viewDisabled = false;
    });
});
//# sourceURL=PlaylistListCtrl.js
"use strict";

angular.module('trikatuka2').controller('TrackListCtrl', function ($scope, $resource, users, Spotify, Pagination, TrackService, Track, $rootScope, $q) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    function loadTracks(params){
        return TrackService.loadTracks(users.user1, params, transformer);
    }

    function load() {
        loadTracks(pagination.getParams()).then(function (playlists) {
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        });
    }

    function transformer(item) {
        return new Track(item.track, users.user1);
    }

    $scope.transferAll = function(){
        var confirmed = confirm('Are you sure you want to transfer all tracks?');
        if(!confirmed){
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        TrackService.transferAll(users.user1, users.user2).then(function(){
            alert('Transfering tracks done.\n\nYou may need to login again to your Spotify client to see the results.');
            $rootScope.$broadcast('ENABLE_VIEW');
        });

    };

    if (users.user1.authData) {
        load();
    }

    $scope.$on('USER_LOGGED_IN', function (event, user) {
        if (user.id === 'user1') {
            load();
        }
    });

    $scope.$on('USER_LOGGED_OUT', function (event, user) {
        if (user.id === 'user1') {
            $scope.items = null;
            pagination.updateTotal(0);
        }
    });
});
//# sourceURL=TrackListCtrl.js
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
//# sourceURL=checkbox.js
"use strict";


angular.module('trikatuka2').directive('owner', function($http){
    return {
        require: 'ngModel',
        template: '<span>{{owner.display_name || owner.id}}</span>',
        replace: true,
        scope:{},
        link: function(scope,elem,attrs,ngModel){
            ngModel.$render = function(){
                $http.get(ngModel.$modelValue.href).then(function(response){
                    scope.owner = response.data;
                });
            };
        }
    }
});
//# sourceURL=owner.js
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
//# sourceURL=Checkboxes.js
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

    Pagination.prototype.updateTotal = function(total){
        this.total = total;
        checkDisabled(this);
    };

    Pagination.prototype.getParams = function(){
        return {
            limit: this.limit,
            offset: this.offset
        }
    };

    Pagination.prototype.nextPage = function () {
        if(this.offset + this.limit < this.total) {
            this.offset += this.limit;
            pageChanged(this);
        }
    };

    Pagination.prototype.prevPage = function () {
        if(this.offset - this.limit >= 0) {
            this.offset -= this.limit;
            pageChanged(this);
        }
    };

    Pagination.prototype.setChangeCallback = function(callback){
        this.changeCallback = callback;
    };

    function pageChanged(pagination){
        checkDisabled(pagination);
        if(pagination.changeCallback){
            pagination.changeCallback(pagination.getParams());
        }
    }

    function checkDisabled(pagination){
        if(pagination.total===0){
            pagination.nextDisabled = true;
            pagination.prevDisabled = true;
        }
        pagination.pages = Math.ceil(pagination.total / pagination.limit);
        pagination.currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

        if(pagination.offset - pagination.limit < 0){
            pagination.prevDisabled = true;
        }
        else{
            pagination.prevDisabled = false;
        }

        if(pagination.offset + pagination.limit >= pagination.total){
            pagination.nextDisabled = true;
        }
        else{
            pagination.nextDisabled = false;
        }
    }

    return Pagination;

});
//# sourceURL=Pagination.js
"use strict";

angular.module('trikatuka2').factory('Playlist', function(Spotify ,$q, PlaylistService, $timeout){
    this.playlistId = null;
    this.tracksCount = null;
    this.name = null;
    this.collaborative = null;

    function Playlist(playlist, user){
        var self = this;
        self.id = playlist.id;
        self.name = playlist.name;
        self.collaborative = playlist.collaborative;
        self.isPublic = playlist.public;
        self.owner = playlist.owner;
        self.tracksCount = playlist.tracks.total;
        self.user = user;
    }

    Playlist.prototype.transfer = function(targetUser){
        var self = this;
        if(self.collaborative || self.owner.id !== self.user.getUserId()){
            return self.followCollaborative(targetUser);
        }
        else{
            return self.copyPlaylist(targetUser);
        }
    };

    Playlist.prototype.followCollaborative = function(targetUser){
        var self = this;
        var data = {
            public: this.isPublic
        };
        var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/followers', this.owner.id, this.id);
        return Spotify.put(url, targetUser, data).then(function(){
            return {
                success: true,
                playlist: self
            }
        }, function(){
            return {
                success: false,
                playlist: self
            }
        });
    };

    Playlist.prototype.copyPlaylist = function(targetUser){
        var self = this;

        return this.loadTracks().then(function(tracks){
            return PlaylistService.createPlaylist(targetUser, self.name, self.isPublic).then(function(playlistResponse){
                var newPlaylistId = playlistResponse.data.id;
                return PlaylistService.addTracksToPlaylist(tracks, targetUser, newPlaylistId).then(function(){
                    return {
                        success: true,
                        playlist: self
                    }
                });
            });
        },function(){
            return {
                success: false,
                playlist: self
            };
        });
    };

    Playlist.prototype.loadTracks = function(){
        var self = this;
        function load(params) {
            var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/tracks',self.user.getUserId(), self.id);
            return Spotify.get(url, self.user, params);
        }

        var total = this.tracksCount;
        var itemsPerPage = 100;

        var pages = Math.ceil(total / itemsPerPage);
        var promises = [];

        for (var i = 0; i < pages; i++) {
            promises.push(load({offset: i * itemsPerPage, limit: itemsPerPage}));
        }

        return $q.all(promises).then(function (results) {
            var tracks = [];
            _.each(results, function (result) {
                tracks = tracks.concat(result.data.items);
            });
            return tracks;
        });

    };

    return Playlist;

});
//# sourceURL=Playlist.js
"use strict";

angular.module('trikatuka2').factory('Track', function(Spotify ,$q, TrackService){
    this.playlistId = null;
    this.tracksCount = null;
    this.name = null;
    this.collaborative = null;

    function Track(track, user){
        var self = this;
        self.id = track.id;
        self.name = track.name;
        self.artists = track.artists;
        self.album = track.album;
        self.user = user;
    }

    return Track;

});
//# sourceURL=Track.js
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

    User.prototype.getAccessToken = function(){
        return this.authData.access_token;
    };

    User.prototype.getUserId = function(){
        return this.data.id;
    };

    User.prototype.refreshToken = function(){
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
"use strict";

angular.module('trikatuka2').factory('mySocket', function (socketFactory) {
    return socketFactory();
});
//# sourceURL=mySocket.js
"use strict";

angular.module('trikatuka2').service('PlaylistService', function (Spotify, $q) {
    this.loadPlaylists = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/playlists', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.createPlaylist = function (user, name, isPublic) {
        var data = {
            name: name,
            public: isPublic || false
        };
        var url = sprintf('https://api.spotify.com/v1/users/%s/playlists', user.getUserId());
        return Spotify.post(url, user, data);
    };

    this.addTracksToPlaylist = function (tracks, user, playlistId) {
        var pages = Math.ceil(tracks.length / 100);

        var promises = [];
        for (var i = 0; i < pages; i++) {
            var data = {
                uris: _.map(tracks.slice(i * 100, (i * 100) + 100), function(item){
                    return item.track.uri;
                })
            };

            var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/tracks', user.getUserId(), playlistId);
            promises.push(Spotify.post(url, user, data))
        }
        return $q.all(promises);
    }
});
//# sourceURL=PlaylistService.js
"use strict";

angular.module('trikatuka2').service('Spotify', function ($http, $q) {
    this.get = function (url, user, params) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'GET',
                headers: buildHeaders(usr),
                params: params
            });
        });
    };

    this.post = function (url, user, data) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'POST',
                headers: buildHeaders(usr),
                data: data
            });
        });
    };

    this.put = function (url, user, data) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'PUT',
                headers: buildHeaders(usr),
                data: data
            });
        });
    };

    function beforeRequest(user) {
        var deferred = $q.defer();

        if (user.authData && !user.authData.error && user.authData.expiresAt <= new Date().getTime()) {
            user.refreshToken().then(function (refreshedUser) {
                deferred.resolve(refreshedUser);
            });
        }
        else if (user.authData && user.authData.error) {
            user.logout();
            deferred.reject();
        }
        else if(user.authData && !user.authData.error){
            deferred.resolve(user);
        }
        else{
            deferred.reject();
        }
        return deferred.promise;
    }

    function buildHeaders(user) {
        return {
            'Authorization': 'Bearer ' + user.getAccessToken(),
            'Accept': 'application/json',
            'Content-type': 'application/json'
        };
    }
});
//# sourceURL=Spotify.js
"use strict";

angular.module('trikatuka2').service('TrackService', function (Spotify, $q) {
    this.loadTracks = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/tracks', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.transferAll = function(user, targetUser){
        var deferred = $q.defer();
        getAll(user).then(function(tracks){
            var url = 'https://api.spotify.com/v1/me/tracks';
            var pages = Math.ceil(tracks.length / 50);
            var promises = [];
            for(var i=0; i<pages; i++) {
                var data  = tracks.slice(i * 50, (i * 50) + 50);
                promises.push(Spotify.put(url, targetUser, data));
            }
            $q.all(promises).then(function(){
                deferred.resolve();
            });
        });
        return deferred.promise;
    };

    function getAll(user){
        var deferred = $q.defer();
        var url = 'https://api.spotify.com/v1/me/tracks';
        var params = {
            limit: 1,
            offset: 0
        };
        Spotify.get(url, user, params).then(function(response){
            var total = response.data.total;
            var tracks = [];

            var pages = Math.ceil(total / 50);
            var promises = [];
            for(var i=0; i<pages; i++) {
                var params = {
                    limit: 50,
                    offset: i*50
                };
                promises.push(load(url,user,params));
            }
            return $q.all(promises).then(function(results){
                _.each(results, function(result){
                    tracks = tracks.concat(result);
                });
                deferred.resolve(tracks);
            });
        });
        return deferred.promise;
    }

    function load(url, user, params){
        return Spotify.get(url, user, params).then(function(response){
            return getIds(response.data.items);
        });
    }

    function getIds(items){
        return _.map(items, function(item){
            return item.track.id;
        });
    }
});
//# sourceURL=TrackService.js
"use strict";

angular.module('trikatuka2').service('users', function (User) {
    this.user1 = null;
    this.user2 = null;
});
//# sourceURL=users.js