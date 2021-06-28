import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-game-menu',
  templateUrl: './create-game-menu.page.html',
  styleUrls: ['./create-game-menu.page.scss'],
})
export class CreateGameMenuPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateRealGamePage() {
    this.navCtrl.navigateForward('create-game');
  }

  navigateCreateVirtualGamePage() {
    this.navCtrl.navigateForward('create-game-virtual');
  }
  
}
