import {ipcMain} from 'electron'

export default class AlbumController {
    constructor(albumService, userService) {
        this.albumService = albumService;
        this.userService = userService;

        const sourceUser = this.userService.getSourceUser()
        const targetUser = this.userService.getTargetUser()


        ipcMain.on('load-albums', async (event, data) => {
            const albums = await this.albumService.loadAlbums(sourceUser, data)

            event.sender.send('load-albums-response', albums)
        })

        ipcMain.on('transfer-albums', async (event) => {
            const albums = await this.albumService.transferAll(sourceUser, targetUser)

            event.sender.send('transfer-albums-response', albums)
        })
    }
}
