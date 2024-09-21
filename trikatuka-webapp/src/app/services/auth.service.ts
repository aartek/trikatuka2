import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {AuthService as SDKAuthService, UserType} from "trikatuka-spotify-sdk";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authorized$: Subject<[UserType, boolean]>;
  private _isAuthorized: {[index: string]: boolean} = {
    [UserType.]
  }
  
  public get isAuthorized() {
    return this._isAuthorized;
  }
  public set isAuthorized(value) {
    this._isAuthorized = value;
  }

  constructor(private readonly authService: SDKAuthService) {
    this.authorized$ = new Subject<[UserType, boolean]>();

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
