# Trikatuka - migration tool for Spotify

**Trikatuka** is a tool helping transfer Spotify playlists and saved tracks from one account to another.

- *Collaborative* playlists are followed.
- *Public* and *private* playlists are copied.
- Subscribed playlists are followed.

**Production app is available here:** http://trikatuka.aknakn.eu

How to: http://aknowakowski.blogspot.com/p/trikatuka2.html

## For developers

Project is based on `AngularJS 1.5`

You need to create an app on https://developer.spotify.com/ and get `clientId`. You must also add `http://localhost:<PORT>/afterLogin` to the urls whitelist.

**How to run**
- optionally change port in `package.json` in `start` command
- set clientId and redirect uri variables in `config.dev.json`
- `npm install`
- `npm start`
- Navigate to `http://localhost:<PORT>`

## Changelog
### 2.6 (2024/09/23)
- Fixed tracks and albums transfer
- App is now fully client side!

### 2.5
- Transfer playlists in the same order

### 2.4
- Added support for transfering albums and playlists.

### 2.3
- Fixed moving playlists. Now requests are made one by one, because posting multiple requests simultaneously caused 500 errors.
- Added "Help" page
