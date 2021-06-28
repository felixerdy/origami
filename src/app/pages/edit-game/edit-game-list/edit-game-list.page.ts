import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';

import { GamesService } from '../../../services/games.service';

// VR world
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-game-list',
  templateUrl: './edit-game-list.page.html',
  styleUrls: ['./edit-game-list.page.scss'],
})
export class EditGameListPage implements OnInit {
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

    this.gamesService.getUserGames().then((res) => {
      console.log(res);
      this.games = res.reverse();

      if (!this.isVirtualWorld) {
        this.games = this.games.filter(game => game.isVRWorld != true); // Exclude VR games
      } else {
        this.games = this.games.filter(game => game.isVRWorld === true); // Get VR games
      }
    });
  }

  doRefresh(event) {
    this.gamesService
      .getUserGames()
      .then((games) => (this.games = games.reverse()))
      .finally(() => event.target.complete());
  }

  filterList(event) {
    this.gamesService
      .getUserGames()
      .then(
        (games) =>
        (this.games = games
          .filter((game) =>
            game.name.toLowerCase().includes(event.detail.value.toLowerCase())
          )
          .reverse())
      );
  }

  gameClick(game: any) {
    console.log(game);
    this.navCtrl.navigateForward(`edit-game/${game._id}`);
  }
}
