import { Component } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { TrackService } from 'trikatuka-spotify-sdk';
import Track from 'trikatuka-spotify-sdk/dist/model/Track';

@Component({
  selector: 'app-track-list',
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent {
  items!: Track[]

  constructor(private readonly authService: AuthService, private readonly tracklistService: TrackService) {

    if (this.authService.isAuthorized) {
      this.loadTracks();
    }

    this.authService.authorized$.subscribe({
      next: () => {
        this.loadTracks();
      }
    })
  }

  private loadTracks() {
    this.tracklistService.loadTracks(
      this.authService.getUser("SOURCE_USER"), { limit: 50, offset: 0 }).then(pageOfPlaylists => {
        this.items = pageOfPlaylists.items;
      })

  }
  ngOnInit(): void {
  }

}
