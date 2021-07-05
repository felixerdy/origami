import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonReorderGroup } from "@ionic/angular";

import mapboxgl from "mapbox-gl";

import { ModalController } from "@ionic/angular";

import { GameFactoryService } from "../../../services/game-factory.service";

import { CreateTaskModalPage } from "./../create-task-modal/create-task-modal.page";
import { CreateModuleModalPage } from "./../create-module-modal/create-module-modal.page";
import { CreateInfoModalComponent } from "./../create-info-modal/create-info-modal.component";

import { NavController } from "@ionic/angular";

import { Game } from "src/app/models/game";
import { CreateFreeTaskModalComponent } from "../create-free-task-modal/create-free-task-modal.component";

import { PopoverController } from "@ionic/angular";
import { PopoverComponent } from "src/app/popover/popover.component";

// VR world
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-game-virtual-list',
  templateUrl: './create-game-virtual-list.page.html',
  styleUrls: ['./create-game-virtual-list.page.scss'],
})
export class CreateGameVirtualListPage implements OnInit {

  game: Game;
  reorder: Boolean = false;

  isVirtualWorld: boolean = true;
  isVRMirrored: boolean = false;

  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  // dismiss modal on hardware back button
  @HostListener("document:ionBackButton", ["$event"])
  private async overrideHardwareBackAction($event: any) {
    await this.modalController.dismiss();
  }

  constructor(
    private gameFactory: GameFactoryService,
    private modalController: ModalController,
    private navCtrl: NavController,
    public popoverController: PopoverController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // to check if VR version is mirrored
    this.route.params.subscribe((params) => {
      if (params.VR_version === "VR_type_B") {
        this.isVRMirrored = true;
      }
    });

    this.gameFactory.getGame().then((game) => (this.game = game));

    console.log(this.gameFactory.game);
  }

  ionViewWillEnter() {
  }

  async presentTaskModal(type: string = "nav", task: any = null, isVirtualWorld: boolean = this.isVirtualWorld, isVRMirrored: boolean = this.isVRMirrored) {
    console.log(task);
    console.log("type: ", type, "task: ", task, "--isVR: ", isVirtualWorld);

    const modal: HTMLIonModalElement = await this.modalController.create({
      component:
        type == "info" ? CreateInfoModalComponent : CreateTaskModalPage,
      backdropDismiss: false,
      componentProps: {
        type,
        task,
        isVirtualWorld,
        isVRMirrored
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log("data:", data);
    if (data != undefined) {
      if (task != null) {
        if (!task._id) {
          task._id = String(Math.floor(Date.now() / 1000));
        }
        this.updateTask(task._id, data.data);
      } else {
        this.addTaskToGame(data.data);
      }
    }

    modal.remove();
  }

  addTaskToGame(task) {
    this.game = this.gameFactory.addTask(task);

    console.log(this.game.tasks);
  }

  deleteTask(taskID) {
    console.log("deleting", taskID);
    this.game = this.gameFactory.removeTask(taskID);
  }

  updateTask(taskID, task) {
    console.log("updating", taskID);
    this.game = this.gameFactory.updateTask(taskID, task);
    console.log(this.game);
  }

  doReorder(ev: any) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log("Dragged from index", ev.detail.from, "to", ev.detail.to);

    // Before complete is called with the items they will remain in the
    // order before the drag
    console.log("Before complete", this.game.tasks);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    this.game.tasks = ev.detail.complete(this.game.tasks);

    this.gameFactory.applyReorder(this.game.tasks);

    console.log(this.game.tasks);

    ev.detail.complete(true);

    // After complete is called the items will be in the new order
    console.log("After complete", this.game.tasks);
  }

  toggleReorder() {
    this.reorder = !this.reorder;
  }

  navigateToOverview() {
    console.log("navigate");

    let bundle = {
      isVRWorld: this.isVirtualWorld,
      isVRMirrored: this.isVRMirrored
    }
    this.navCtrl.navigateForward(`create-game/create-game-overview/${JSON.stringify(bundle)}`);
  }

  async showPopover(ev: any, text: string) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      event: ev,
      translucent: true,
      componentProps: { text },
    });
    return await popover.present();
  }

}