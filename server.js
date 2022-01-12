var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var querystring = require('querystring');
var request = require('request');
var glob = require("glob");
var path = require('path');
var Base64 = require('js-base64').Base64;

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

var server_port = process.env.TRIKATUKA_PORT || 8080,
    server_ip_address = '0.0.0.0';

server.listen(server_port, server_ip_address);
console.log('Magic happens on port ' + server_port);


io.on('connection', function (socket) {
    socket.on('login', function (processId, callback) {
        var host = socket.handshake.headers.host;
        var protocol = socket.secure ? 'https://' : 'http://';
        var redirectUri = protocol + host + '/user_auth_callback';

        var privileges = ['user-library-read',
            'user-library-modify',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public',
            'playlist-modify-private',
            'user-follow-read',
            'user-follow-modify'].join('%20');

        var params = querystring.stringify({
            show_dialog: true,
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
        try {
            if (req.query.error) {
                processAuthCallback(req, res, {}, false);
                return;
            }

            var protocol = req.secure ? 'https://' : 'http://'
            var host = req.headers.host

            var authorization = Base64.encode(CLIENT_ID + ':' + CLIENT_SECRET);
            var payload = {
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: protocol + host + '/user_auth_callback'
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
        }
        catch (err) {
            console.error('Auth error', err, 'Request query:', req.query);
            res.sendStatus(500);
        }
    });

app.route('/files')
    .get(function (req, res) {
        if (process.env.NODE_ENV === 'dev') {
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
    try {
        var split = req.query.state.split(':');
        var socketId = split[0];
        var signingProccessId = split[1];
        body.signingProccessId = signingProccessId;
        io.to(socketId).emit(success ? 'user_logged_in' : 'user_not_logged_in', body);
        res.redirect('afterLogin');
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal server error occurred")
    }
}
