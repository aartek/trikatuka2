import { Component } from '@angular/core';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'trikatuka-webapp';

  tabs: MenuItem[];

  constructor() {
    this.tabs = [
      {label: 'Playlists', icon: 'pi pi-fw pi-home'},
      {label: 'Tracks', icon: 'pi pi-fw pi-home'}
    ]
  }

}
