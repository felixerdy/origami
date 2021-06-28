import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-play-game-list',
  templateUrl: './play-game-list.page.html',
  styleUrls: ['./play-game-list.page.scss']
})
export class PlayGameListPage implements OnInit {
  games: any;

  // VR world
  isVirtualWorld: boolean = false;

  constructor(
    public navCtrl: NavController,
    private gamesService: GamesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // VR world
    // to seperate realworld games from VR ones in view
    this.route.params.subscribe((params) => {
      if (params.worldType === "VRWorld") {
        this.isVirtualWorld = true;
      }
    });

    this.gamesService.getGames(false).then(res => res.content).then(games => {
      this.games = games.reverse();
    
      if (!this.isVirtualWorld) {
        this.games = this.games.filter(game => game.isVRWorld != true); // Exclude VR games
        console.log("-RW-this.games:", this.games);
      } else {
        this.games = this.games.filter(game => game.isVRWorld === true); // Get VR games
        console.log("-VR_W-this.games:", this.games);
      }
    });
  }

  doRefresh(event) {
    this.gamesService
      .getGames(true).then(res => res.content)
      .then(games => (this.games = games.reverse()))
      .finally(() => event.target.complete());
  }

  filterList(event) {
    this.gamesService
      .getGames(true).then(res => res.content)
      .then(
        games =>
          (this.games = games.filter(game =>
            game.name.toLowerCase().includes(event.detail.value.toLowerCase())
          ).reverse())
      );
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`play-game/game-detail/${game._id}`);
  }
}
