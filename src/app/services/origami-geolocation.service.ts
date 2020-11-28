import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Plugins, GeolocationPosition } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class OrigamiGeolocationService {

  public geolocationSubscription: Observable<GeolocationPosition>;

  private watchID: string;

  constructor() {
    this.geolocationSubscription = Observable.create((observer: Subscriber<GeolocationPosition>) => {
      this.watchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error);
        }
        observer.next(position);
      });
    }).pipe(shareReplay());
    console.log('initializing geolocation service');
  }

  init() {

  }

  getSinglePositionWatch(): Observable<GeolocationPosition> {
    return new Observable((observer: Subscriber<GeolocationPosition>) => {
      const singleWatchID = Plugins.Geolocation.watchPosition({ enableHighAccuracy: true }, (position, error) => {
        if (error != null) {
          observer.error(error);
        }
        observer.next(position);
      });

      return () => {
        Plugins.Geolocation.clearWatch({ id: singleWatchID });
      };
    });

  }

  clear() {
    Plugins.Geolocation.clearWatch({ id: this.watchID });
  }
}
