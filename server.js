var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var querystring = require('querystring');
var request = require('request');
var glob = require("glob");
var path = require('path');
// var Base64 = require('js-base64').Base64;

var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var webappDir = path.join(__dirname, '/webapp/');

app.use(express.static(webappDir));     // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                     // log every request to the console
app.use(bodyParser.urlencoded({extended: false}));    // parse application/x-www-form-urlencoded
app.use(bodyParser.json());    // parse application/json
app.use(methodOverride());                  // simulate DELETE and PUT

var server_port,
    server_ip_address,
    baseUrl;

if (process.env.name === 'dev') {
    server_port = 7878;
    server_ip_address = 'localhost';
    baseUrl = 'http://localhost:7878'
}
else {
    server_port = 8080;
    server_ip_address = '0.0.0.0';
    baseUrl = 'http://trikatuka-aknakn.rhcloud.com';
}

server.listen(server_port, server_ip_address);
console.log('Magic happens on port ' + server_port);


io.on('connection', function (socket) {
    socket.on('login', function (processId, callback) {

        var redirectUri = baseUrl + '/user_auth_callback';
        var privileges = ['user-library-read',
            'user-library-modify',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public',
            'playlist-modify-private',
            'user-follow-read'].join('%20');

        var params = querystring.stringify({
            show_dialog: true,
            //client_secret: CLIENT_SECRET,
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: redirectUri,
            state: this.client.id + ':' + processId
        });

        var url = 'https://accounts.spotify.com/authorize?' + params + '&scope=' + privileges;
        callback(url);
    });

    socket.on('refreshToken', function (refreshToken, callback) {
        var payload = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        };
        var headers = {'Authorization': 'Basic ' + Base64.encode(CLIENT_ID + ':' + CLIENT_SECRET)};
        var url = 'https://accounts.spotify.com/api/token';
        request({
            method: 'POST',
            url: url,
            headers: headers,
            form: payload,
            json: true
        }, function (error, response, body) {
            callback(body);
        });
    });
});

app.route('/afterLogin').get(function (req, res) {
    res.sendFile(path.join(webappDir, 'afterLogin.html'));
});

app.route('/user_auth_callback')
    .get(function (req, res) {
        if (req.query.error) {
            processAuthCallback(req, res, {}, false);
            return;
        }

        var authorization = Base64.encode(CLIENT_ID + ':' + CLIENT_SECRET);
        var payload = {
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: baseUrl + '/user_auth_callback'
        };
        var headers = {'Authorization': 'Basic ' + authorization};
        var url = 'https://accounts.spotify.com/api/token';

        request({
            url: url,
            headers: headers,
            form: payload,
            method: 'POST',
            json: true
        }, function (error, response, body) {
            processAuthCallback(req, res, body, true);
        });
    });

app.route('/files')
    .get(function (req, res) {
        if (process.env.name === 'dev') {
            var files = glob.sync(path.join(webappDir, 'app/**/*.js'));
            var result = [];
            var filter = webappDir.replace(/\\/g, '/');
            files.forEach(function (file) {
                result.push(file.split(filter)[1]);
            });
            res.json(result);
        }
        else {
            res.json(['dist/app.min.js']);
        }

    });

function processAuthCallback(req, res, body, success) {
    var split = req.query.state.split(':');
    var socketId = split[0];
    var signingProccessId = split[1];
    body.signingProccessId = signingProccessId;
    console.log(`Login for socket ${socketId} signingProcessId ${signingProccessId} success?: ${success}`)
    io.to(socketId).emit(success ? 'user_logged_in' : 'user_not_logged_in', body);
    res.redirect('afterLogin');
}


var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    }, decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    }, _utf8_encode: function (e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }, _utf8_decode: function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
};