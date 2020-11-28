import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Plugins, DeviceInfo, GeolocationPosition } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { OrigamiGeolocationService } from './origami-geolocation.service';
import { Subscription } from 'rxjs';

import { FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { OrigamiOrientationService } from './origami-orientation.service';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private game: string;
  private gameName: string;
  private device: DeviceInfo;
  private waypoints: any[];
  private events: any[];

  private start: String;

  private players: string[];

  private position: GeolocationPosition;
  private positionWatch: Subscription;
  private deviceOrientationSubscription: Subscription;
  private compassHeading: number;

  private map: any;

  private task: any;

  private panCounter = 0;
  private zoomCounter = 0;
  private rotationCounter = 0;
  private lastHeading: number = undefined;

  constructor(
    private http: HttpClient,
    private geolocateService: OrigamiGeolocationService,
    private orientationService: OrigamiOrientationService
  ) { }

  async init(gameID, name, map: any, players: string[]) {
    this.positionWatch = this.geolocateService.geolocationSubscription.subscribe(position => {
      this.position = position;
    });

    this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe((heading: number) => {
      if (this.lastHeading === undefined) {
        this.lastHeading = heading;
      }

      let diff = Math.abs(this.lastHeading - heading);
      diff = Math.abs((diff + 180) % 360 - 180);
      if (diff > 15) {
        this.rotationCounter += diff;
        this.lastHeading = heading;
      }

      this.compassHeading = heading;
    });

    this.map = map;
    this.map.on('moveend', moveEvent => {
      if (moveEvent.type == 'moveend' && moveEvent.originalEvent) {
        this.panCounter++;
      }
    });

    this.map.on('zoomend', zoomEvent => {
      if (zoomEvent.type == 'zoomend' && zoomEvent.originalEvent) {
        this.zoomCounter++;
      }
    });

    this.game = gameID;
    this.gameName = name;
    this.device = await Plugins.Device.getInfo().then(device => device);
    this.waypoints = [];
    this.events = [];
    this.start = new Date().toISOString();
    this.players = players;
    this.task = undefined;
  }

  clear() {
    this.deviceOrientationSubscription.unsubscribe();
    this.positionWatch.unsubscribe();
  }

  setTask(task) {
    this.task = task;
    this.panCounter = 0;
    this.zoomCounter = 0;
    this.rotationCounter = 0;
  }

  addWaypoint(waypoint) {
    if (this.waypoints != undefined) {
      this.waypoints.push({
        ...waypoint,
        timestamp: new Date().toISOString(),
        position: this.position,
        mapViewport: {
          bounds: this.map.getBounds(),
          center: this.map.getCenter(),
          zoom: this.map.getZoom(),
          bearing: this.map.getBearing(),
          pitch: this.map.getPitch()
        },
        compassHeading: this.compassHeading,
        interaction: {
          panCount: this.panCounter,
          zoomCount: this.zoomCounter / 2,
          rotation: this.rotationCounter
        }
      });
    }
  }

  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
      position: this.position,
      mapViewport: {
        bounds: this.map.getBounds(),
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch()
      },
      compassHeading: this.compassHeading,
      task: this.task,
      interaction: {
        panCount: this.panCounter,
        zoomCount: this.zoomCounter / 2,
        rotationCount: this.rotationCounter
      }
    });
    console.log(this.events);
  }

  async uploadTrack() {
    const data = {
      game: this.game,
      name: this.gameName,
      start: this.start,
      end: new Date().toISOString(),
      device: this.device,
      waypoints: this.waypoints,
      events: this.events,
      answers: null,
      players: this.players,
      playersCount: this.players.length
    };

    console.log(data);

    // Plugins.Geolocation.clearWatch({ id: this.positionWatch });
    this.deviceOrientationSubscription.unsubscribe();
    this.positionWatch.unsubscribe();

    try {
      const ret = await Plugins.Filesystem.mkdir({
        path: 'origami/tracks',
        directory: FilesystemDirectory.Documents,
        recursive: true // like mkdir -p
      });
      console.log('Created dir', ret);
    } catch (e) {
      console.error('Unable to make directory', e);
    }

    try {
      const result = await Plugins.Filesystem.writeFile({
        path: `origami/tracks/${this.gameName.replace(/ /g, '_')}-${this.start}.json`,
        data: JSON.stringify(data),
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      });
      console.log('Wrote file', result);
    } catch (e) {
      console.error('Unable to write file', e);
    }

    // return new Promise(() => { })

    return this.http
      .post(`${environment.apiURL}/track`, data, { observe: 'response' })
      .toPromise();
  }
}
