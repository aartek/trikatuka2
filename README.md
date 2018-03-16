# Trikatuka - Spotify migration tool

**Trikatuka** is a tool helping transfer Spotify playlists and saved tracks from one account to another.

- *Collaborative* playlists are followed.
- *Public* and *private* playlists are copied.
- Subscribed playlists are followed.

**Production app is available here:** http://trikatuka.aknakn.eu

How to: http://aknowakowski.blogspot.com/p/trikatuka2.html

## For developers

Project is based on `Node.js` and `AngularJS 1.5`

You need to create an app on https://developer.spotify.com/ and get `clientId` and `clientSecret`. You must also add `http://localhost:7878/client_auth_callback` and `http://localhost:7878/user_auth_callback` to the urls whitelist.

**How to run**
- set enviromental variables `CLIENT_ID=<clientId>` and `CLIENT_SECRET=<clientSecret>`
- `npm install`
- `node serverapp.js`
- Navigate to `http://localhost:7878`


## Changelog
### 2.3
- Fixed moving playlists. Now requests are made one by one, because posting multiple requests simultaneously caused 500 errors.
- Added "Help" page
