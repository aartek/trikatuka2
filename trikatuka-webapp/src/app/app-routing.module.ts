import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlaylistListComponent} from "./components/playlist-list/playlist-list.component";
import {TrackListComponent} from "./components/track-list/track-list.component";

const routes: Routes = [
  { path: 'playlists', component: PlaylistListComponent },
  { path: 'tracks', component: TrackListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
