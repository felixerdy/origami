import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-game-virtual-menu',
  templateUrl: './create-game-virtual-menu.page.html',
  styleUrls: ['./create-game-virtual-menu.page.scss'],
})
export class CreateGameVirtualMenuPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateVRGameTypeA() {
    this.navCtrl.navigateForward(`create-game-virtual-list/${"VR_type_A"}`);
  }

  navigateCreateVRGameTypeB() {
    this.navCtrl.navigateForward(`create-game-virtual-list/${"VR_type_B"}`);
  }

}
