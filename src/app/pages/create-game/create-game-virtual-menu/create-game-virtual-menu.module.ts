import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGameVirtualMenuPage } from './create-game-virtual-menu.page';


const routes: Routes = [
  {
    path: '',
    component: CreateGameVirtualMenuPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CreateGameVirtualMenuPage]
})
export class CreateGameVirtualMenuPageModule {}
