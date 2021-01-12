import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { PopoverController } from '@ionic/angular';

import { NavController } from '@ionic/angular';

import { Game } from '../../../models/game';
import { Storage } from '@ionic/storage';


import { GameFactoryService } from '../../../services/game-factory.service';

import { PopoverComponent } from '../../../popover/popover.component';
import { GamesService } from 'src/app/services/games.service';

import { AnimationOptions } from 'ngx-lottie';

import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { environment } from 'src/environments/environment';
import { calcBounds } from '../../../helpers/bounds'
import { AnswerType, QuestionType } from 'src/app/models/types';
import { LandmarkControl } from 'src/app/mapControllers/landmark-control';
import { featureCollection } from '@turf/helpers'
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-edit-game-overview',
  templateUrl: './edit-game-overview.page.html',
  styleUrls: ['./edit-game-overview.page.scss']
})
export class EditGameOverviewPage implements AfterViewInit {
  @ViewChild('boundingMap') mapContainer;

  public game: Game;
  public lottieConfig: AnimationOptions;
  showSuccess = false;
  showUpload = false;
  showNameError = false
  map: mapboxgl.Map;
  draw: MapboxDraw

  mapSection = false;
  mapSectionVisible = true;
  landmarkControl: LandmarkControl;

  geofence = false;



  constructor(
    public popoverController: PopoverController,
    public navCtrl: NavController,
    public gameFactory: GameFactoryService,
    public gamesService: GamesService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,

  ) {
    this.lottieConfig = {
      path: 'assets/lottie/astronaut.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      styles: [// ACTIVE (being drawn)
        // line stroke
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
            'line-dasharray': [3, 2],
            'line-width': 5
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
            'fill-outline-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
            'fill-opacity': 0.5
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
            'line-dasharray': [3, 2],
            'line-width': 5
          }
        },
        // vertex point halos
        {
          id: 'gl-draw-polygon-and-line-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 3,
            'circle-color': getComputedStyle(document.documentElement).getPropertyValue('--ion-color-warning'),
          }
        },

        // INACTIVE (static, already drawn)
        // line stroke
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          paint: {
            'fill-color': '#000',
            'fill-outline-color': '#000',
            'fill-opacity': 0.5
          }
        },
        // polygon outline
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        }
      ]
    });
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {
      this.gamesService
        .getGame(params.id)
        .then(res => res.content)
        .then(game => {
          this.game = game
          this.gameFactory.flushGame();
          this.gameFactory.addGameInformation(this.game)

          if (this.game.bbox?.features?.length > 0) {
            this.mapSection = true
          }

          this.mapSectionVisible = this.game.mapSectionVisible
          this.geofence = this.game.geofence

          if (this.mapSection) {
            this.changeDetectorRef.detectChanges();
            this.initMap()
          }
        })
    });

    // this.gameFactory.getGame().then(game => { this.game = game }).finally(() => {
    //   this.initMap()
    // })
  }

  initMap() {
    mapboxgl.accessToken = environment.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: this.mapContainer.nativeElement,
      style: {
        version: 8,
        metadata: {
          'mapbox:autocomposite': true,
          'mapbox:type': 'template'
        },
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
          },
          mapbox: {
            url: 'mapbox://mapbox.mapbox-streets-v7',
            type: 'vector'
          }
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'building',
            type: 'fill',
            source: 'mapbox',
            'source-layer': 'building',
            paint: {
              'fill-color': '#d6d6d6',
              'fill-opacity': 0,
            },
            interactive: true
          },
        ]
      },
      center: [8, 51.8],
      zoom: 2
    });


    this.map.addControl(this.draw, 'top-left');


    this.map.on('load', () => {
      if (this.game.bbox != undefined) {
        if (this.game.bbox.type == 'FeatureCollection') {
          this.game.bbox.features.forEach(element => {
            element.properties = {
              ...element.properties
            }
            this.draw.add(element)
          });
        }
      }

      let bounds = new mapboxgl.LngLatBounds();

      this.game.tasks.forEach(task => {
        bounds = bounds.extend(calcBounds(task))
      });

      // this.map.resize()

      if (!bounds.isEmpty()) {
        this.map.fitBounds(bounds, {
          padding: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40
          }, duration: 1000,
          maxZoom: 16
        });
      }

      this.map.loadImage(
        '/assets/icons/directionv2-richtung.png',
        (error, image) => {
          if (error) throw error;

          this.map.addImage('view-direction-task', image);
        })

      this.landmarkControl = new LandmarkControl(this.map)

      let qtlandmarks = featureCollection([])
      let searchareas = featureCollection([])
      let landmarks = featureCollection([])

      for (const [i, task] of this.game.tasks.entries()) {
        if (task.answer.type == AnswerType.POSITION && task.answer.position?.geometry?.coordinates) {
          const el = document.createElement('div');
          el.className = 'waypoint-marker';

          new mapboxgl.Marker(el, {
            anchor: 'bottom',
            offset: [15, 0]
          }).setLngLat(task.answer.position.geometry.coordinates)
            .addTo(this.map);
        }

        if (task.question.type == QuestionType.MAP_FEATURE || task.question.type == QuestionType.MAP_FEATURE_FREE || task.question.type == QuestionType.MAP_FEATURE_PHOTO) {
          qtlandmarks = featureCollection([...qtlandmarks.features, ...task.question.geometry.features])
        }

        if (task.question.area?.features?.length > 0) {
          searchareas = featureCollection([...searchareas.features, ...task.question.area.features])
        }

        if (task.mapFeatures.landmarks) {
          landmarks = featureCollection([...landmarks.features, ...task.mapFeatures.landmarkFeatures.features])
        }

        if (task.question.type == QuestionType.MAP_DIRECTION_MARKER || task.question.type == QuestionType.MAP_DIRECTION) {
          const directionBearing = task.question.direction.bearing || 0

          this.map.addSource(`viewDirectionTask${i}`, {
            type: 'geojson',
            data: task.question.direction.position.geometry
          });
          this.map.addLayer({
            id: `viewDirectionTask${i}`,
            source: `viewDirectionTask${i}`,
            type: 'symbol',
            layout: {
              'icon-image': 'view-direction-task',
              'icon-size': 0.65,
              'icon-offset': [0, -8],
              'icon-rotate': directionBearing - this.map.getBearing()
            }
          });
        }
      }
      this.landmarkControl.setQTLandmark(qtlandmarks)
      this.landmarkControl.setSearchArea(searchareas)
      this.landmarkControl.setLandmark(landmarks)

    });
  }

  mapSectionToggleChange(event) {
    if (this.mapSection) {
      this.changeDetectorRef.detectChanges();

      this.initMap();
    } else {
      this.geofence = false;
    }
  }

  mapSectionVisibleChange(visible: boolean) {
    if (this.mapSectionVisible != visible) {
      this.draw.deleteAll()
      this.mapSectionVisible = visible
    }
  }

  async showTrackingInfo(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }

  uploadGame() {
    this.gameFactory.addGameInformation({
      bbox: this.mapSection ? this.draw.getAll() : null,
      mapSectionVisible: this.mapSectionVisible,
      geofence: this.geofence,
      name: this.game.name,
      place: this.game.place
    });
    console.log(this.gameFactory.game);

    this.showUpload = true;

    this.gamesService.updateGame(this.gameFactory.game).then(res => {
      if (res.status == 200) {
        this.showSuccess = true;
        this.gameFactory.flushGame();
      }
    }).catch(e => {
      console.error(e)
      this.showUpload = false;
      this.showNameError = true;
    });

    // this.gamesService
    //   .postGame(this.gameFactory.game)
    //   .then(res => {
    //     if (res.status == 200) {
    //       this.showSuccess = true;
    //       this.gameFactory.flushGame();
    //     }
    //   })
    //   .catch(e => console.error(e));
  }

  navigateHome() {
    this.navCtrl.navigateRoot('/');
  }

  async showPopover(ev: any, text: string) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text }
    });
    return await popover.present();
  }
}
