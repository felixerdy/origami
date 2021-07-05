import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-play-game-menu',
  templateUrl: './play-game-menu.page.html',
  styleUrls: ['./play-game-menu.page.scss'],
})
export class PlayGameMenuPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateToRealGameListPage() {
    this.navCtrl.navigateForward(`play-game/play-game-list/${"RealWorld"}`);
  }

  navigateToVirtualGameListPage() {
    this.navCtrl.navigateForward(`play-game/play-game-list/${"VRWorld"}`);
  }

}