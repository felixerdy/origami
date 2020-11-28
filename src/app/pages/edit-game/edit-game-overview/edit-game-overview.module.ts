import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditGameOverviewPage } from './edit-game-overview.page';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { environment } from 'src/environments/environment';

// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}

const routes: Routes = [
  {
    path: '',
    component: EditGameOverviewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    LottieModule.forRoot({ player: playerFactory }),
    NgxMapboxGLModule.withConfig({
      accessToken: environment.mapboxAccessToken,
    }),
  ],
  declarations: [EditGameOverviewPage]
})
export class EditGameOverviewPageModule { }
