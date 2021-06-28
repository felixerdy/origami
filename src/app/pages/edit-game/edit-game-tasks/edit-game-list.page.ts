import { Component, OnInit, ViewChild, HostListener } from "@angular/core";
import { IonReorderGroup } from "@ionic/angular";

import mapboxgl from "mapbox-gl";

import { ModalController } from "@ionic/angular";

import { GameFactoryService } from "../../../services/game-factory.service";

import { CreateTaskModalPage } from "../../create-game/create-task-modal/create-task-modal.page";
import { CreateModuleModalPage } from "../../create-game/create-module-modal/create-module-modal.page";
import { CreateInfoModalComponent } from "../../create-game/create-info-modal/create-info-modal.component";

import { NavController } from "@ionic/angular";

import { Game } from "src/app/models/game";
import { GamesService } from "src/app/services/games.service";
import { ActivatedRoute } from "@angular/router";
import { CreateFreeTaskModalComponent } from "../../create-game/create-free-task-modal/create-free-task-modal.component";
import { Task } from "src/app/models/task";

@Component({
  selector: "app-edit-game-list",
  templateUrl: "./edit-game-list.page.html",
  styleUrls: ["./edit-game-list.page.scss"],
})
export class EditGameListPage implements OnInit {
  // name: String;
  // tasks: any[] = [];
  game: Game;
  reorder: Boolean = false;

  // VR world
  isVirtualWorld: boolean = false;

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
    private gamesService: GamesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.gamesService
        .getGame(params.id)
        .then((res) => res.content)
        .then((game) => {
          this.game = game;
          this.gameFactory.flushGame();
          this.gameFactory.addGameInformation(this.game);

          // VR world
          if( game.isVRWorld !== undefined &&  game.isVRWorld != false){
            this.isVirtualWorld = true;
          }
        });
    });
  }

  ionViewWillEnter() {
    // mapboxgl.accessToken =
    //   "pk.eyJ1IjoiZmVsaXhhZXRlbSIsImEiOiI2MmE4YmQ4YjIzOTI2YjY3ZWFmNzUwOTU5NzliOTAxOCJ9.nshlehFGmK_6YmZarM2SHA";
    // const map = new mapboxgl.Map({
    //   container: "create-game-map",
    //   style: "mapbox://styles/mapbox/streets-v9",
    //   center: [8, 51.8],
    //   zoom: 2
    // });
    // const geolocate = new mapboxgl.GeolocateControl({
    //   positionOptions: {
    //     enableHighAccuracy: true
    //   },
    //   fitBoundsOptions: {
    //     maxZoom: 25
    //   },
    //   trackUserLocation: true
    // });
    // map.addControl(geolocate);
    // // let watch = this.geolocation.watchPosition();
    // // watch.subscribe((data) => {
    // //   console.log(data)
    // // });
    // // Add geolocate control to the map.
    // map.on("load", () => {
    //   geolocate.trigger();
    // });
  }

  async presentTaskModal(type: string = "nav", task: Task = null, isVirtualWorld: boolean = this.isVirtualWorld) {
    console.log(task);

    const modal: HTMLIonModalElement = await this.modalController.create({
      component:
        type == "info" ? CreateInfoModalComponent : CreateTaskModalPage,
      backdropDismiss: false,
      componentProps: {
        type,
        task,
        isVirtualWorld  // added to view VR world map instead of real map if true  
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
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

  addTaskToGame(task: Task) {
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

  uploadGame() {
    this.gamesService.updateGame(this.game).then((res) => {
      if (res.status == 200) {
        this.navCtrl.navigateForward(
          `edit-game/edit-game-overview/${this.game._id}`
        );
        // this.gameFactory.flushGame();
      }
    });
  }

  navigateBack() {
    this.gameFactory.flushGame();
    this.navCtrl.navigateBack("create-game");
  }
}
