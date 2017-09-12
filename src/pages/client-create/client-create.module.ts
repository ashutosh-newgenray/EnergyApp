import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClientCreatePage } from './client-create';

@NgModule({
  declarations: [
    ClientCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(ClientCreatePage),
  ],
  exports: [
    ClientCreatePage
  ]
})
export class ClientCreatePageModule {}
