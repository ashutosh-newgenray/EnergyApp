import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClientDetailsPopOverPage } from './client-details-pop-over';

@NgModule({
  declarations: [
    ClientDetailsPopOverPage,
  ],
  imports: [
    IonicPageModule.forChild(ClientDetailsPopOverPage),
  ],
  exports: [
    ClientDetailsPopOverPage
  ]
})
export class ClientDetailsPopOverPageModule {}
