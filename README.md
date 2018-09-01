# Trikatuka - Spotify migration tool

**Trikatuka** is a tool helping transfer Spotify playlists and saved tracks from one account to another.

- *Collaborative* playlists are followed.
- *Public* and *private* playlists are copied.
- Subscribed playlists are followed.

**Production app is available here:** http://trikatuka.aknakn.eu

How to: http://aknowakowski.blogspot.com/p/trikatuka2.html

## For developers

Project is based on `Node.js` and `AngularJS 1.5`

You need to create an app on https://developer.spotify.com/ and get `clientId` and `clientSecret`. You must also add `http://localhost:<PORT>/user_auth_callback` to the urls whitelist.

**How to run**
- set env variables
  - `CLIENT_ID=<clientId>`
  - `CLIENT_SECRET=<clientSecret>`
  - `TRIKATUKA_PORT=<port>`
  - Optionally set `NODE_ENV=dev` if you want to run app in development mode (for debuggable angular app's sources)
- `npm install`
- `npm run build`
- `node server.js`
- Navigate to `http://localhost:<PORT>`

**Run with docker**

Build image
```
docker buidocker build . -t trikatuka2
```

Run
```
docker run -d --net host --name trikatuka2 --restart unless-stopped \
                         -e CLIENT_ID='xxxx' \
                         -e CLIENT_SECRET=xxxx \
                         -e TRIKATUKA_PORT=<PORT> \
                         trikatuka2
```
(`--net host` is required. Otherwise socket.io won't work correctly.)

## Changelog
### 2.4
- Added support for transfering albums and playlists.

### 2.3
- Fixed moving playlists. Now requests are made one by one, because posting multiple requests simultaneously caused 500 errors.
- Added "Help" page
