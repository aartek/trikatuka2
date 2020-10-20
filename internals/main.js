const run = require("./Application")
const {app, BrowserWindow} = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('webapp/index.html')
}


app.whenReady().then(createWindow).then(() => run())

