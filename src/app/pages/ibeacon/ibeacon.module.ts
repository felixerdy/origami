import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IbeaconPageRoutingModule } from './ibeacon-routing.module';

import { IbeaconPage } from './ibeacon.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IbeaconPageRoutingModule
  ],
  declarations: [IbeaconPage]
})
export class IbeaconPageModule {}
