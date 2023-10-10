import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {AuthService as AS, UserType} from "trikatuka-spotify-sdk";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authorized$: Subject<boolean>;
  isAuthorized = false;

  constructor(private readonly authService: AS) {
    this.authorized$ = new Subject<boolean>();

    this.authService.handleAuthCallback()
      .then(() => {
        this.isAuthorized = true;
        this.authorized$.next(this.isAuthorized)
      })
  }

  getUser(userType: UserType) {
    return this.authService.getUser(userType)
  }
  auth(userType: UserType) {
    this.authService.authorize(userType)
  }
}
