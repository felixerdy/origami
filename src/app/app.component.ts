import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { Plugins, StatusBarStyle } from "@capacitor/core";
import { AuthService } from "./services/auth-service.service";

import { Response } from "capacitor-idfa-ios-app-tracking";
const { IOSAppTracking } = Plugins;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent {
  constructor(private platform: Platform, private authService: AuthService) {
    this.initializeApp();

    if (window.localStorage.getItem("bg_refreshtoken"))
      this.authService.recoverSession(
        window.localStorage.getItem("bg_refreshtoken")
      );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      Plugins.StatusBar.setStyle({ style: StatusBarStyle.Light }).catch((err) =>
        console.log(err)
      );
      if (this.platform.is("android")) {
        Plugins.StatusBar.setBackgroundColor({ color: "white" });
      }

      this.getTrackingPermission()
        .then((res) => {
          // User has allowed tracking.
          // res.status is always "unrequested" here
        })
        .catch((err) => {
          // User has denied tracking.
        });
    });
  }

  /**
   * Requests tracking permission
   */
  getTrackingPermission(): Promise<Response> {
    return new Promise((resolve, reject) => {
      IOSAppTracking.getTrackingStatus().then((res: Response) => {
        console.log("Tracking Status: " + res.status);
        if (res.status === "unrequested") {
          IOSAppTracking.requestPermission().then((response: Response) => {
            console.log("Tracking Status: " + response.status);
            resolve(response);
          });
        }
        if (res.status === "authorized" || res.status === "restricted") {
          resolve(res);
        }
        if (res.status === "denied") {
          reject("Tracking permission denied");
        }
      });
    });
  }
}
