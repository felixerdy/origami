import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IbeaconPage } from './ibeacon.page';

const routes: Routes = [
  {
    path: '',
    component: IbeaconPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IbeaconPageRoutingModule {}
