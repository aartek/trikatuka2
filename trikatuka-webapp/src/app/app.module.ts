import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {TabMenuModule} from 'primeng/tabmenu';
import {MenubarModule} from 'primeng/menubar';
import {PanelModule} from 'primeng/panel';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {PlaylistListComponent} from './components/playlist-list/playlist-list.component';
import {TrackListComponent} from './components/track-list/track-list.component';
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {AuthService, create, PlaylistService, TrackService} from "trikatuka-spotify-sdk";
import {CardModule} from "primeng/card";



const sdkConfig = {
  clientId: '27edb2ed1e2c4c5c8cd7e192c81e37e8',
  redirectUri: window.location.origin,
  trackTransferDelayMs: 2000,
}
const SDK = create(sdkConfig)
@NgModule({
  declarations: [
    AppComponent,
    PlaylistListComponent,
    TrackListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MenubarModule,
    TabMenuModule,
    PanelModule,
    NoopAnimationsModule,
    TableModule,
    ButtonModule,
    CardModule,
  ],
  providers: [
    {provide: AuthService, useValue: SDK.authService},
    {provide: PlaylistService, useValue: SDK.playlistService},
    {provide: TrackService, useValue: SDK.trackService},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
