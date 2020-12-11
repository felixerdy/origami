import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth-service.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    if (this.authService.getUserValue()) {
      return true;
    } else {
      //super dirty hack for now
      if (this.authService.getRefreshTokenInProgressValue()) return true;
      this.router.navigate(["user/login"]);
      return false;
    }
  }
}
