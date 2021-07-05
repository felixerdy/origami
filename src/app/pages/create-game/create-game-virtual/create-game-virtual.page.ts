import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

@Component({
  selector: 'app-create-game-virtual',
  templateUrl: './create-game-virtual.page.html',
  styleUrls: ['./create-game-virtual.page.scss'],
})
export class CreateGameVirtualPage implements OnInit {

  constructor(public navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateCreateVirtualGamePage() {
    this.navCtrl.navigateForward('create-game-virtual-menu');
  }

  navigateEditVirtualGame() {
    // VR world
    this.navCtrl.navigateForward(`edit-game-list/${"VRWorld"}`);
  }

}