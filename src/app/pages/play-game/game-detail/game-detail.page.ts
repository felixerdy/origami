import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';


import mapboxgl from 'mapbox-gl';

import { GamesService } from '../../../services/games.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
})
export class GameDetailPage implements OnInit {

  @ViewChild('map') mapContainer;

  game: any;
  activities: any[];
  points: any[];

  constructor(public navCtrl: NavController, private route: ActivatedRoute, private gamesService: GamesService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gamesService.getGame(params.id)
        .then(games => {
          this.game = games[0];
        })
        .finally(() => {
          console.log(this.game);
          // this.activities = this.game.activities
          // this.points = this.activities[0].points
          // if(this.mapContainer.nativeElement) {
          //   this.initMap()
          // }
        });
    });

  }

  // initMap() {
  //   mapboxgl.accessToken = environment.mapboxAccessToken;
  //   const map = new mapboxgl.Map({
  //     container: this.mapContainer.nativeElement,
  //     style: 'mapbox://styles/mapbox/streets-v9',
  //   });


  //   map.on('load', () => {
  //     const tasks = this.game.tasks;
  //     // const markers = activity.points.map(point => new mapboxgl.Marker().setLngLat([point.lng, point.lat]).addTo(map))

  //     var bounds = new mapboxgl.LngLatBounds();

  //     tasks.forEach((task) => {
  //       if (task.settings.point)
  //         bounds.extend(task.settings.point.geometry.coordinates);
  //     });

  //     map.fitBounds(bounds, { padding: 40, duration: 2000 });
  //   })
  // }

  pointClick(point) {
    console.log(point);
  }

  startGame() {
    this.navCtrl.navigateForward(`play-game/playing-game/${this.game._id}`);
  }

}
