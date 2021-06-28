import { Component, OnInit } from '@angular/core';

import { NavController } from '@ionic/angular';




@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateGamePage() {
    this.navCtrl.navigateForward('create-game/create-game-list');
  }

  navigateEditGame() {
    this.navCtrl.navigateForward(`edit-game-list/${"RealWorld"}`);
  }

}
