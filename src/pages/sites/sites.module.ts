import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SitesPage } from './sites';

@NgModule({
  declarations: [
    SitesPage,
  ],
  imports: [
    IonicPageModule.forChild(SitesPage),
  ],
  exports: [
    SitesPage
  ]
})
export class SitesPageModule {}
