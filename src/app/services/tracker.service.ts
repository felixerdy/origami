import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Plugins, DeviceInfo, GeolocationPosition } from '@capacitor/core';

import { environment } from '../../environments/environment';
import { OrigamiGeolocationService } from './origami-geolocation.service';
import { Subscription } from 'rxjs';

import { FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
import { OrigamiOrientationService } from './origami-orientation.service';

// VR world
import { AvatarPosition } from 'src/app/models/avatarPosition'
import { Coords } from 'src/app/models/coords'

@Injectable({
  providedIn: 'root',
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

  // VR World
  private avatarcoords: Coords;
  private avatarPosition: AvatarPosition;
  private avatarPositionWatch: Subscription;
  isVirtualWorld: boolean = false;
  private avatarOrientationSubscription: Subscription;
  initialAvatarLoc: any;


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

  async init(gameID, name, map: any, players: string[], isVirtualWorld: boolean, initialAvatarLoc: any) {

    this.isVirtualWorld = isVirtualWorld;
    this.initialAvatarLoc = initialAvatarLoc;

    if (!isVirtualWorld) {
      this.positionWatch = this.geolocateService.geolocationSubscription.subscribe(
        (position) => {
          this.position = position;
        }
      );

      this.deviceOrientationSubscription = this.orientationService.orientationSubscription.subscribe(
        (heading: number) => {
          if (this.lastHeading === undefined) {
            this.lastHeading = heading;
          }

          let diff = Math.abs(this.lastHeading - heading);
          diff = Math.abs(((diff + 180) % 360) - 180);
          if (diff > 15) {
            this.rotationCounter += diff;
            this.lastHeading = heading;
          }

          this.compassHeading = heading;
        }
      );

    } else {
      // ** VR world ** //
      this.avatarPositionWatch = this.geolocateService.avatarGeolocationSubscription.subscribe(avatarPosition => {
        // Set timestamp (to do: timestamp)
        if (this.avatarPosition === undefined) {
          // Initial avatar position
          this.avatarPosition = new AvatarPosition(0, new Coords(this.initialAvatarLoc.lat, this.initialAvatarLoc.lng));
        } else {
          this.avatarPosition = new AvatarPosition(0, new Coords(parseFloat(avatarPosition["z"]) / 111200, parseFloat(avatarPosition["x"]) / 111000));
        }
      });


      this.avatarOrientationSubscription = this.orientationService.avatarOrientationSubscription.subscribe(
        (avatarHeading: number) => {
          if (this.lastHeading === undefined) {
            this.lastHeading = avatarHeading;
          }

          let diff = Math.abs(this.lastHeading - avatarHeading);
          diff = Math.abs(((diff + 180) % 360) - 180);
          if (diff > 15) {
            this.rotationCounter += diff;
            this.lastHeading = avatarHeading;
          }

          this.compassHeading = avatarHeading;
        }
      );
    }
    this.map = map;
    this.map.on('moveend', (moveEvent) => {
      if (moveEvent.type == 'moveend' && moveEvent.originalEvent) {
        this.panCounter++;
      }
    });

    this.map.on('zoomend', (zoomEvent) => {
      if (zoomEvent.type == 'zoomend' && zoomEvent.originalEvent) {
        this.zoomCounter++;
      }
    });

    this.game = gameID;
    this.gameName = name;
    this.device = await Plugins.Device.getInfo().then((device) => device);
    this.waypoints = [];
    this.events = [];
    this.start = new Date().toISOString();
    this.players = players;
    this.task = undefined;
  }

  clear() {
    if (!this.isVirtualWorld) {
      this.positionWatch.unsubscribe();
      this.deviceOrientationSubscription.unsubscribe();
    } else {
      this.avatarPositionWatch.unsubscribe();
      this.avatarOrientationSubscription.unsubscribe();
    }
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
        position: (this.isVirtualWorld ? this.avatarPosition : this.position),
        mapViewport: {
          bounds: this.map.getBounds(),
          center: this.map.getCenter(),
          zoom: this.map.getZoom(),
          bearing: this.map.getBearing(),
          pitch: this.map.getPitch(),
        },
        compassHeading: this.compassHeading,
        interaction: {
          panCount: this.panCounter,
          zoomCount: this.zoomCounter / 2,
          rotation: this.rotationCounter,
        },
      });
    }
  }

  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
      position: (this.isVirtualWorld ? this.avatarPosition : this.position),
      mapViewport: {
        bounds: this.map.getBounds(),
        center: this.map.getCenter(),
        zoom: this.map.getZoom(),
        bearing: this.map.getBearing(),
        pitch: this.map.getPitch(),
      },
      compassHeading: this.compassHeading,
      task: this.task,
      interaction: {
        panCount: this.panCounter,
        zoomCount: this.zoomCounter / 2,
        rotationCount: this.rotationCounter,
      },
    });
    console.log(this.events);
  }

  createHeaders() {
    let headers = new HttpHeaders();
    const token = window.localStorage.getItem('bg_accesstoken');
    if (token) {
      headers = headers.append('Authorization', 'Bearer ' + token);
    }
    headers = headers.append('Content-Type', 'application/json');
    return headers;
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
      playersCount: this.players.length,
    };

    console.log(data);

    // Plugins.Geolocation.clearWatch({ id: this.positionWatch });
    if (!this.isVirtualWorld) {
      this.deviceOrientationSubscription.unsubscribe();
      this.positionWatch.unsubscribe();
    } else {
      this.avatarOrientationSubscription.unsubscribe();
      this.avatarPositionWatch.unsubscribe();
    }


    try {
      const ret = await Plugins.Filesystem.mkdir({
        path: 'origami/tracks',
        directory: FilesystemDirectory.Documents,
        recursive: true, // like mkdir -p
      });
      console.log('Created dir', ret);
    } catch (e) {
      console.log('Unable to make directory', e);
    }

    try {
      const result = await Plugins.Filesystem.writeFile({
        path: `origami/tracks/${this.gameName.replace(/ /g, '_')}-${this.start
          }.json`,
        data: JSON.stringify(data),
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8,
      });
      console.log('Wrote file', result);
    } catch (e) {
      console.error('Unable to write file', e);
    }

    // return new Promise(() => { })

    return this.http
      .post(`${environment.apiURL}/track`, data, {
        headers: this.createHeaders(),
        observe: 'response',
      })
      .toPromise();
  }
}
