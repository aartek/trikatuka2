import {Component, OnInit} from '@angular/core';
import {PlaylistService, UserType} from "trikatuka-spotify-sdk";
import {AuthService} from "../../services/auth.service";
import Playlist from "trikatuka-spotify-sdk/dist/model/Playlist";

@Component({
  selector: 'app-playlist-list',
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss']
})
export class PlaylistListComponent implements OnInit {

  items: Playlist[];

  constructor(private readonly authService: AuthService, private readonly playlistService: PlaylistService) {
    this.items = []

    if(this.authService.isAuthorized) {
      this.loadPlaylists();
    }

    this.authService.authorized$.subscribe({
      next: () => {
        this.loadPlaylists();
      }
    })
  }

  private loadPlaylists() {
    this.playlistService.loadPlaylists(
      this.authService.getUser("SOURCE_USER"), { limit: 50, offset: 0 }).then(pageOfPlaylists => {
      this.items = pageOfPlaylists.items;
    })

  }
  ngOnInit(): void {
  }
}
