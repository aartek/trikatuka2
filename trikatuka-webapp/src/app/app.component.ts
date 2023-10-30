import { Component } from '@angular/core';
import {MenuItem} from 'primeng/api';
import {AuthService} from "./services/auth.service";
import {UserType} from "trikatuka-spotify-sdk";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'trikatuka-webapp';

  tabs: MenuItem[];
  activeItem: MenuItem;
  user1Type: UserType = 'SOURCE_USER'
  user2Type: UserType = 'TARGET_USER'

  constructor(private authService: AuthService) {
    this.tabs = [
      {label: 'Playlists', icon: 'pi pi-bars', routerLink: ['/playlists']},
      {label: 'Tracks', icon: 'pi pi-play', routerLink: ['/tracks']}
    ]

    this.activeItem = this.tabs[0];
  }

  auth(userType: UserType){
    this.authService.auth(userType)
  }

}
