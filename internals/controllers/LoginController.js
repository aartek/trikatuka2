const {ipcMain} = require('electron')

class LoginController {

    constructor(authService) {
        this.authService = authService;

        ipcMain.on('login', async (event, userType) => {
            await this.authService.openAuthWindow(userType, (authData) => {
                event.sender.send('login-response', authData)
            })
        })

        ipcMain.on('refresh-token', async (event, data) => {
            await this.authService.refreshToken(data.refreshToken, (authData) => {
                event.sender.send('refresh-token-response', authData)
            })
        })
    }
}

module.exports = LoginController
